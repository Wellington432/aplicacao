jest.mock('../../../../src/services/order/GetOrCreateCartService', () => ({
  GetOrCreateCartService: jest.fn().mockImplementation(() => ({ execute: jest.fn().mockResolvedValue({ id: 'cart-1' }) })),
}));

import { GetOrCreateCartController } from '../../../../src/controllers/order/GetOrCreateCartController';
import { GetOrCreateCartService } from '../../../../src/services/order/GetOrCreateCartService';
import { createAuthRequest, createResponse } from '../../../helpers/httpMocks';

describe('GetOrCreateCartController.handle', () => {
  it('deve retornar carrinho associado ao usuário autenticado', async () => {
    const res = createResponse();
    await new GetOrCreateCartController().handle(createAuthRequest(), res);
    expect((GetOrCreateCartService as jest.Mock).mock.results[0].value.execute).toHaveBeenCalledWith({
      user_id: 'user-1',
    });
    expect(res.json).toHaveBeenCalledWith({ id: 'cart-1' });
  });
});
