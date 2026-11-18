import { Request, Response } from 'express';
import { PasswordResetService } from '../../services/user/PasswordResetService';

function detalhesParaLog(error: unknown) {
  if (!(error instanceof Error)) return { nome: 'Erro', mensagem: String(error) };
  const codigo = (error as Error & { code?: unknown }).code;
  return {
    nome: error.name,
    mensagem: error.message,
    ...(typeof codigo === 'string' || typeof codigo === 'number' ? { codigo } : {}),
  };
}

class RequestPasswordResetController {
  async handle(req: Request, res: Response) {
    try {
      await new PasswordResetService().solicitar(req.body?.email);
      return res.json({ message: 'Se o e-mail estiver cadastrado, você receberá um link para redefinir a senha.' });
    } catch (error) {
      console.error('Falha ao enviar e-mail de recuperação:', detalhesParaLog(error));
      if (error instanceof Error && error.name === 'ConfiguracaoEmailError') {
        return res.status(503).json({ error: 'O envio de e-mail não está disponível no momento. Contate o administrador.' });
      }
      return res.status(503).json({ error: 'Não foi possível enviar o link agora. Tente novamente mais tarde.' });
    }
  }
}

export { RequestPasswordResetController };
