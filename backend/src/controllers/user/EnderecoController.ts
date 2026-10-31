import { Request, Response } from 'express';
import { AuthRequest } from '../../types/AuthRequest';
import prismaClient from '../../prisma';

interface ViaCepResponse {
  cep?: string;
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
}

export class EnderecoController {
  async buscarCep(req: Request, res: Response) {
    const cep = String(req.params.cep ?? '').replace(/\D/g, '');
    if (!/^\d{8}$/.test(cep)) {
      return res.status(400).json({ error: 'CEP inválido. Informe os 8 dígitos.' });
    }

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      if (!response.ok) throw new Error('Não foi possível consultar o CEP agora.');
      const data = await response.json() as ViaCepResponse;
      if (data.erro || !data.localidade || !data.uf) {
        return res.status(404).json({ error: 'CEP não encontrado.' });
      }

      return res.json({
        cep: data.cep ?? cep,
        logradouro: data.logradouro ?? '',
        bairro: data.bairro ?? '',
        cidade: data.localidade,
        estado: data.uf,
      });
    } catch {
      return res.status(502).json({ error: 'Não foi possível consultar o CEP. Tente novamente.' });
    }
  }

  async buscarDoUsuario(req: AuthRequest, res: Response) {
    const { userId } = req.params;
    if (userId !== req.user_id) return res.status(403).json({ error: 'Acesso negado.' });

    const endereco = await prismaClient.endereco.findUnique({ where: { id_usuario: req.user_id } });
    return res.json(endereco);
  }

  async salvar(req: AuthRequest, res: Response) {
    const { cep, logradouro, bairro, cidade, estado, numero, complemento } = req.body;
    const cepLimpo = String(cep ?? '').replace(/\D/g, '');
    const camposObrigatorios = [logradouro, bairro, cidade, estado, numero];

    if (!/^\d{8}$/.test(cepLimpo) || camposObrigatorios.some((campo) => !String(campo ?? '').trim())) {
      return res.status(400).json({ error: 'Preencha um endereço válido, incluindo CEP e número.' });
    }

    const endereco = await prismaClient.endereco.upsert({
      where: { id_usuario: req.user_id },
      create: {
        id_usuario: req.user_id,
        cep: cepLimpo,
        logradouro: String(logradouro).trim(),
        bairro: String(bairro).trim(),
        cidade: String(cidade).trim(),
        estado: String(estado).trim().toUpperCase(),
        numero: String(numero).trim(),
        complemento: String(complemento ?? '').trim() || null,
      },
      update: {
        cep: cepLimpo,
        logradouro: String(logradouro).trim(),
        bairro: String(bairro).trim(),
        cidade: String(cidade).trim(),
        estado: String(estado).trim().toUpperCase(),
        numero: String(numero).trim(),
        complemento: String(complemento ?? '').trim() || null,
      },
    });

    return res.json(endereco);
  }
}