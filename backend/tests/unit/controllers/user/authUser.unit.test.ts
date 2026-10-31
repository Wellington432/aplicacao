jest.mock('../../../../src/services/user/AuthUserService', () => ({
  AuthUserService: jest.fn().mockImplementation(() => ({ execute: jest.fn().mockResolvedValue({ token: 'jwt' }) })),
}));

import { AuthUserController } from '../../../../src/controllers/user/AuthUserController';
import { createRequest, createResponse } from '../../../helpers/httpMocks';
import { AuthUserService } from '../../../../src/services/user/AuthUserService';

describe('AuthUserController.handle', () => {
  it('deve encaminhar credenciais e retornar a sessão', async () => {
    const req = createRequest({ body: { email: 'ana@example.test', senha: 'senha1234' } });
    const res = createResponse();

    await new AuthUserController().handle(req, res);
    expect((AuthUserService as jest.Mock).mock.results[0].value.execute).toHaveBeenCalledWith(
      req.body,
    );
    expect(res.json).toHaveBeenCalledWith({ token: 'jwt' });
  });
});
