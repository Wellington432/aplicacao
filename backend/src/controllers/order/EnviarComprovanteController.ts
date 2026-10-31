import { Response } from 'express';
import { AuthRequest } from '../../types/AuthRequest';
import { EnviarComprovanteService } from '../../services/order/EnviarComprovanteServices';

class EnviarComprovanteController {
  async handle(req: AuthRequest, res: Response) {
    if (!req.file) {
      return res.status(400).json({ error: 'Comprovante é obrigatório.' });
    }

    const { id_compra } = req.params;

    if (typeof id_compra !== 'string') {
      return res.status(400).json({ error: 'ID da compra inválido.' });
    }

    const service = new EnviarComprovanteService();
    const result = await service.execute({
      id: id_compra,
      user_id: req.user_id,
      nomeArquivo: req.file.filename,
    });

    return res.json(result);
  }
}

export { EnviarComprovanteController };
