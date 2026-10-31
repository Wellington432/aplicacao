import { gerarPayloadPix, obterDadosRecebedorPix } from '../../modulos/pix/PixServices';
import QRCode from 'qrcode';
import prismaClient from '../../prisma';
import { TipoEntrega } from '@prisma/client';

interface CheckoutRequest {
  id_compra: string;
  tipo_entrega: TipoEntrega;
  endereco?: {
    cep: string;
    logradouro: string;
    bairro: string;
    cidade: string;
    estado: string;
    numero: string;
    complemento?: string;
  };
  user_id: string;
}

function getFreteEntrega(): number {
  const frete = Number(process.env.FRETE_ENTREGA ?? '0');
  if (!Number.isFinite(frete) || frete < 0) throw new Error('FRETE_ENTREGA deve ser um valor válido e não negativo.');
  return Math.round(frete * 100) / 100;
}

class CheckoutService {
  async execute({ id_compra, tipo_entrega, endereco, user_id }: CheckoutRequest) {
    const compra = await prismaClient.compra.findUnique({
      where: { id: id_compra },
      include: { itens: { include: { produto: true } } },
    });

    if (!compra) throw new Error('Compra não encontrada.');
    if (compra.id_usuario !== user_id) throw new Error('Acesso negado.');
    if (compra.status !== 'CARRINHO') throw new Error('Este pedido já foi processado.');
    if (compra.itens.length === 0) throw new Error('O carrinho está vazio.');

    if (tipo_entrega !== 'RETIRADA' && tipo_entrega !== 'ENTREGA') {
      throw new Error('Tipo de entrega inválido.');
    }

    let enderecoEntrega: string | null = null;
    let enderecoParaSalvar: NonNullable<CheckoutRequest['endereco']> | null = null;
    if (tipo_entrega === 'ENTREGA') {
      const enderecoSalvo = endereco ?? await prismaClient.endereco.findUnique({ where: { id_usuario: user_id } });
      if (!enderecoSalvo) throw new Error('Cadastre seu endereço antes de escolher entrega.');

      const cep = String(enderecoSalvo.cep ?? '').replace(/\D/g, '');
      const logradouro = String(enderecoSalvo.logradouro ?? '').trim();
      const bairro = String(enderecoSalvo.bairro ?? '').trim();
      const cidadeTexto = String(enderecoSalvo.cidade ?? '').trim();
      const estadoTexto = String(enderecoSalvo.estado ?? '').trim();
      const numero = String(enderecoSalvo.numero ?? '').trim();
      if (!/^\d{8}$/.test(cep) || [logradouro, bairro, cidadeTexto, estadoTexto, numero].some((campo) => !campo)) {
        throw new Error('Preencha um endereço válido, incluindo CEP e número.');
      }

      const cidade = cidadeTexto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
      const estado = estadoTexto.toUpperCase();
      if (cidade !== 'jales' || estado !== 'SP') {
        throw new Error('Entregas disponíveis apenas para Jales-SP. Fora dessa região, disponibilizamos apenas retirada no local.');
      }

      enderecoEntrega = [
        `${logradouro}, ${numero}`,
        String(enderecoSalvo.complemento ?? '').trim(),
        bairro,
        `${cidadeTexto} - ${estado}`,
        `CEP ${cep}`,
      ].filter(Boolean).join(', ');
      if (endereco) {
        enderecoParaSalvar = {
          cep,
          logradouro,
          bairro,
          cidade: cidadeTexto,
          estado,
          numero,
          complemento: String(enderecoSalvo.complemento ?? '').trim() || null,
        };
      }
    }

    for (const item of compra.itens) {
      if (!item.produto.ativo) {
        throw new Error(`"${item.produto.nome}" não está mais disponível. Remova-o do carrinho.`);
      }
      if (item.produto.estoque < item.quantidade) {
        throw new Error(`Estoque insuficiente para "${item.produto.nome}".`);
      }
    }

    // Soma em centavos para evitar erro de ponto flutuante (ex.: 0.1 + 0.2).
    const totalCentavos = compra.itens.reduce(
      (soma, item) => soma + Math.round(Number(item.produto.preco) * 100) * item.quantidade,
      0
    );
    const freteCentavos = tipo_entrega === 'ENTREGA' ? Math.round(getFreteEntrega() * 100) : 0;
    const total = (totalCentavos + freteCentavos) / 100;

   
    const copiaCola = gerarPayloadPix({
      ...obterDadosRecebedorPix(),
      valor: total,
      txid: id_compra.replace(/-/g, '').substring(0, 25),
    });

    const qrCodeBase64 = await QRCode.toDataURL(copiaCola);

    await prismaClient.$transaction(async (transaction) => {
      if (enderecoParaSalvar) {
        await transaction.endereco.upsert({
          where: { id_usuario: user_id },
          create: { ...enderecoParaSalvar, id_usuario: user_id },
          update: enderecoParaSalvar,
        });
      }
      for (const item of compra.itens) {
        await transaction.itemCompra.update({
          where: { id: item.id },
          data: { preco_unitario: item.produto.preco },
        });
      }
      await transaction.compra.update({
        where: { id: id_compra },
        data: {
          tipo_entrega,
          endereco: enderecoEntrega,
          forma_pagamento: 'PIX',
          total,
          status: 'AGUARDANDO_PAGAMENTO', 
        },
      });
    });

    return {
      checkout_url: `/pagamento/${id_compra}`,
      qr_code_base64: qrCodeBase64,
      copia_cola: copiaCola,
      total,
      id_compra,
    };
  }
}

export { CheckoutService, getFreteEntrega };