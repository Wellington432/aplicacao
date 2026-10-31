jest.mock('../../../../src/services/order/CreateOrderSerivices', () => ({
  CreateOrderService: jest.fn().mockImplementation(() => ({ execute: jest.fn().mockResolvedValue({ id: 'item-1' }) })),
}));

import { CreateOrderController } from '../../../../src/controllers/order/CreateOrderController';
import { CreateOrderService } from '../../../../src/services/order/CreateOrderSerivices';
import { createAuthRequest, createResponse } from '../../../helpers/httpMocks';

describe('CreateOrderController.handle', () => {
  it('deve incluir usuário autenticado ao criar item', async () => {
    const res = createResponse();
    await new CreateOrderController().handle(
      createAuthRequest({ body: { id_compra: 'cart-1', id_produto: 'prod-1', quantidade: 2 } }),
      res,
    );
    expect((CreateOrderService as jest.Mock).mock.results[0].value.execute).toHaveBeenCalledWith({
      id_compra: 'cart-1',
      id_produto: 'prod-1',
      quantidade: 2,
      user_id: 'user-1',
    });
    expect(res.json).toHaveBeenCalledWith({ id: 'item-1' });
  });
});
