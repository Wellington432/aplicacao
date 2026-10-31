jest.mock('../../../../src/services/user/PasswordResetService', () => ({
  PasswordResetService: jest.fn().mockImplementation(() => ({
    redefinir: jest.fn().mockResolvedValue(undefined),
  })),
}));

import { ResetPasswordController } from '../../../../src/controllers/user/ResetPasswordController';
import { createRequest, createResponse } from '../../../helpers/httpMocks';
import { PasswordResetService } from '../../../../src/services/user/PasswordResetService';

describe('ResetPasswordController.handle', () => {
  it('deve confirmar redefinição concluída', async () => {
    const res = createResponse();
    await new ResetPasswordController().handle(
      createRequest({ body: { token: 'token', senha: 'novaSenha123' } }),
      res,
    );
    expect(res.json).toHaveBeenCalledWith({ message: 'Senha redefinida com sucesso.' });
  });

  it('deve responder 400 para erro conhecido de validação', async () => {
    (PasswordResetService as jest.Mock).mockImplementationOnce(() => ({
      redefinir: jest.fn().mockRejectedValue(new Error('A senha deve ter ao menos 8 caracteres.')),
    }));
    const res = createResponse();
    await new ResetPasswordController().handle(createRequest(), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'A senha deve ter ao menos 8 caracteres.',
    });
  });

  it('deve responder 500 para erro desconhecido', async () => {
    (PasswordResetService as jest.Mock).mockImplementationOnce(() => ({
      redefinir: jest.fn().mockRejectedValue(new Error('db unavailable')),
    }));
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const res = createResponse();
    await new ResetPasswordController().handle(createRequest(), res);
    expect(res.status).toHaveBeenCalledWith(500);
    errorSpy.mockRestore();
  });
});
