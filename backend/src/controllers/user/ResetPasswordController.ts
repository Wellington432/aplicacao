import { Request, Response } from 'express';
import { PasswordResetService } from '../../services/user/PasswordResetService';

class ResetPasswordController {
  async handle(req: Request, res: Response) {
    try {
      await new PasswordResetService().redefinir(req.body?.token, req.body?.senha);
      return res.json({ message: 'Senha redefinida com sucesso.' });
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : '';
      const errosDeValidacao = [
        'Este link é inválido ou expirou. Solicite uma nova recuperação.',
        'A senha deve ter ao menos 8 caracteres.',
        'A senha deve ter no máximo 72 bytes.',
      ];
      if (errosDeValidacao.includes(mensagem)) {
        return res.status(400).json({ error: mensagem });
      }

      console.error('Falha ao redefinir senha:', error);
      return res.status(500).json({ error: 'Não foi possível redefinir a senha agora.' });
    }
  }
}

export { ResetPasswordController };