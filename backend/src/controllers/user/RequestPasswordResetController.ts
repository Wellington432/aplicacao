import { Request, Response } from 'express';
import { PasswordResetService } from '../../services/user/PasswordResetService';

function codigoDoErro(error: unknown) {
  if (!(error instanceof Error)) return undefined;
  const codigo = (error as Error & { code?: unknown }).code;
  return typeof codigo === 'string' || typeof codigo === 'number' ? codigo : undefined;
}

class RequestPasswordResetController {
  async handle(req: Request, res: Response) {
    try {
      await new PasswordResetService().solicitar(req.body?.email);
      return res.json({ message: 'Se o e-mail estiver cadastrado, você receberá um link para redefinir a senha.' });
    } catch (error) {
      console.error('Falha ao enviar e-mail de recuperação:', { codigo: codigoDoErro(error) });
      if (error instanceof Error && error.name === 'ConfiguracaoEmailError') {
        return res.status(503).json({ error: 'O envio de e-mail não está disponível no momento. Contate o administrador.' });
      }
      return res.status(503).json({ error: 'Não foi possível enviar o e-mail agora. Tente novamente em alguns minutos.' });
    }
  }
}

export { RequestPasswordResetController };
