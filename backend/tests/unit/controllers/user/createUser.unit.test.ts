jest.mock('../../../../src/services/user/CreateUserServices', () => ({
  CreateUserService: jest.fn().mockImplementation(() => ({ execute: jest.fn().mockResolvedValue({ id: 'user-1' }) })),
}));

import { CreateUserController } from '../../../../src/controllers/user/CreateUserController';
import { createRequest, createResponse } from '../../../helpers/httpMocks';
import { CreateUserService } from '../../../../src/services/user/CreateUserServices';

describe('CreateUserController.handle', () => {
  it('deve passar os campos enviados ao serviço e responder o usuário criado', async () => {
    const req = createRequest({ body: { nome: 'Ana', email: 'ana@example.test', senha: 'senha1234' } });
    const res = createResponse();

    await new CreateUserController().handle(req, res);

    expect(CreateUserService).toHaveBeenCalledTimes(1);
    expect((CreateUserService as jest.Mock).mock.results[0].value.execute).toHaveBeenCalledWith(
      req.body,
    );
    expect(res.json).toHaveBeenCalledWith({ id: 'user-1' });
  });
});
