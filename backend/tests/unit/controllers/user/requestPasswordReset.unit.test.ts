jest.mock('../../../../src/services/user/PasswordResetService', () => ({
  PasswordResetService: jest.fn().mockImplementation(() => ({
    solicitar: jest.fn().mockResolvedValue(undefined),
    redefinir: jest.fn().mockResolvedValue(undefined),
  })),
}));

import { RequestPasswordResetController } from '../../../../src/controllers/user/RequestPasswordResetController';
import { createRequest, createResponse } from '../../../helpers/httpMocks';
import { PasswordResetService } from '../../../../src/services/user/PasswordResetService';

describe('RequestPasswordResetController.handle', () => {
  it('deve retornar resposta neutra quando serviço conclui', async () => {
    const res = createResponse();
    await new RequestPasswordResetController().handle(
      createRequest({ body: { email: 'ana@example.test' } }),
      res,
    );

    expect((PasswordResetService as jest.Mock).mock.results[0].value.solicitar).toHaveBeenCalledWith(
      'ana@example.test',
    );
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('Se o e-mail estiver cadastrado') }),
    );
  });

  it('deve retornar 503 quando envio falha', async () => {
    (PasswordResetService as jest.Mock).mockImplementationOnce(() => ({
      solicitar: jest.fn().mockRejectedValue(new Error('SMTP offline')),
    }));
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const res = createResponse();

    await new RequestPasswordResetController().handle(createRequest(), res);
    expect(res.status).toHaveBeenCalledWith(503);
    errorSpy.mockRestore();
  });
});
