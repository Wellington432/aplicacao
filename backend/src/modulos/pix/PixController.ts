import { Response } from 'express';
import { AuthRequest } from '../../types/AuthRequest';
import QRCode from 'qrcode';
import prismaClient from '../../prisma';
import { gerarPayloadPix, obterDadosRecebedorPix } from './PixServices';

export async function gerarQrCode(req: AuthRequest, res: Response) {
  const { compraId } = req.params;

  if (typeof compraId !== 'string') {
    return res.status(400).json({ error: 'compraId inválido' });
  }

  const compra = await prismaClient.compra.findUnique({ where: { id: compraId } });
  if (!compra) return res.status(404).json({ error: 'Compra não encontrada' });

  // Antes qualquer usuário logado conseguia ver o Pix/valor do pedido de outra pessoa.
  if (compra.id_usuario !== req.user_id) {
    return res.status(403).json({ error: 'Acesso negado.' });
  }

  if (compra.status === 'CARRINHO') {
    return res.status(400).json({ error: 'Este pedido ainda não foi finalizado.' });
  }

  const txid = compraId.replace(/-/g, '').slice(0, 25);
  const dadosRecebedor = obterDadosRecebedorPix();
  const brCode = gerarPayloadPix({
    ...dadosRecebedor,
    valor: Number(compra.total),
    txid,
  });
  const qrCodeBase64 = await QRCode.toDataURL(brCode);

  // status e total permitem que a tela de pagamento mostre o estado real do pedido.
  return res.json({
    brCode,
    qrCodeBase64,
    status: compra.status,
    total: Number(compra.total),
    nomeRecebedor: dadosRecebedor.nomeRecebedor,
    chavePix: dadosRecebedor.chavePix,
    cidade: dadosRecebedor.cidade,
  });
}
