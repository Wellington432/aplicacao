import { Request, Response } from 'express';
import { PasswordResetService } from '../../services/user/PasswordResetService';

class RequestPasswordResetController {
  async handle(req: Request, res: Response) {
    try {
      await new PasswordResetService().solicitar(req.body?.email);
      return res.json({ message: 'Se o e-mail estiver cadastrado, você receberá um link para redefinir a senha.' });
    } catch (error) {
      console.error('Falha ao enviar e-mail de recuperação:', error);
      return res.status(503).json({ error: 'Não foi possível enviar o link agora. Tente novamente mais tarde.' });
    }
  }
}

export { RequestPasswordResetController };