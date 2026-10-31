jest.mock('../../../../src/services/user/ListUserByIdService', () => ({
  ListUserByIdService: jest.fn().mockImplementation(() => ({ execute: jest.fn().mockResolvedValue({ id: 'user-1' }) })),
}));

import prisma from '../../../../src/prisma';
import { ListUserByIdController } from '../../../../src/controllers/user/ListUserByIdController';
import { createAuthRequest, createResponse } from '../../../helpers/httpMocks';
import { ListUserByIdService } from '../../../../src/services/user/ListUserByIdService';

describe('ListUserByIdController.handle', () => {
  it('deve buscar somente o usuário autenticado', async () => {
    const res = createResponse();
    await new ListUserByIdController().handle(createAuthRequest(), res);

    expect((ListUserByIdService as jest.Mock).mock.results[0].value.execute).toHaveBeenCalledWith({
      id: 'user-1',
    });
    expect(res.json).toHaveBeenCalledWith({ id: 'user-1' });
    expect(prisma.usuario.findFirst).not.toHaveBeenCalled();
  });
});
