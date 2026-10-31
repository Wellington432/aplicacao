import fs from 'fs';
import path from 'path';
import { Response } from 'express';
import { AuthRequest } from '../../types/AuthRequest';
import prismaClient from '../../prisma';
import { COMPROVANTES_DIR, COMPROVANTES_DIR_LEGADO } from '../../middlewares/multerConfig';

/** Entrega o arquivo do comprovante apenas para o dono do pedido ou para um admin. */
class VerComprovanteController {
  async handle(req: AuthRequest, res: Response) {
    const { id_compra } = req.params;

    if (typeof id_compra !== 'string') {
      return res.status(400).json({ error: 'ID da compra inválido.' });
    }

    const [compra, usuario] = await Promise.all([
      prismaClient.compra.findUnique({
        where: { id: id_compra },
        select: { id_usuario: true, comprovante_url: true },
      }),
      prismaClient.usuario.findUnique({ where: { id: req.user_id }, select: { tipo: true } }),
    ]);

    if (!compra || !compra.comprovante_url) {
      return res.status(404).json({ error: 'Comprovante não encontrado.' });
    }

    if (compra.id_usuario !== req.user_id && usuario?.tipo !== 'ADM') {
      return res.status(403).json({ error: 'Acesso negado.' });
    }

    // basename impede path traversal (ex.: "../../.env").
    const nome = path.basename(compra.comprovante_url);
    const caminho = [COMPROVANTES_DIR, COMPROVANTES_DIR_LEGADO]
      .map((dir) => path.join(dir, nome))
      .find((p) => fs.existsSync(p));

    if (!caminho) {
      return res.status(404).json({ error: 'Arquivo do comprovante não encontrado.' });
    }

    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'private, no-store');
    return res.sendFile(caminho);
  }
}

export { VerComprovanteController };
