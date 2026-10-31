jest.mock('../../../../src/services/user/AuthGoogleUserService', () => ({
  AuthGoogleUserService: jest.fn().mockImplementation(() => ({ execute: jest.fn().mockResolvedValue({ token: 'jwt' }) })),
}));

import { AuthGoogleUserController } from '../../../../src/controllers/user/AuthGoogleUserController';
import { createRequest, createResponse } from '../../../helpers/httpMocks';
import { AuthGoogleUserService } from '../../../../src/services/user/AuthGoogleUserService';

describe('AuthGoogleUserController.handle', () => {
  it('deve aceitar body ausente sem lançar e enviar credenciais vazias ao serviço', async () => {
    const res = createResponse();
    await new AuthGoogleUserController().handle(createRequest({ body: undefined }), res);

    expect((AuthGoogleUserService as jest.Mock).mock.results[0].value.execute).toHaveBeenCalledWith({
      code: undefined,
      credential: undefined,
    });
  });

  it('deve encaminhar credencial informada e responder o usuário', async () => {
    const res = createResponse();
    await new AuthGoogleUserController().handle(
      createRequest({ body: { credential: 'test-credential' } }),
      res,
    );
    expect(res.json).toHaveBeenCalledWith({ token: 'jwt' });
  });
});
