jest.mock('../../../../src/services/order/UpdateOrderServices', () => ({
  UpdateOrderService: jest.fn().mockImplementation(() => ({ execute: jest.fn().mockResolvedValue({ id: 'item-1' }) })),
}));

import { UpdateOrderController } from '../../../../src/controllers/order/UpdateOrderController';
import { UpdateOrderService } from '../../../../src/services/order/UpdateOrderServices';
import { createAuthRequest, createResponse } from '../../../helpers/httpMocks';

describe('UpdateOrderController.handle', () => {
  it('deve enviar id, quantidade e usuário autenticado ao serviço', async () => {
    const res = createResponse();
    await new UpdateOrderController().handle(
      createAuthRequest({ body: { id: 'item-1', quantidade: 3 } }),
      res,
    );
    expect((UpdateOrderService as jest.Mock).mock.results[0].value.execute).toHaveBeenCalledWith({
      id: 'item-1',
      quantidade: 3,
      user_id: 'user-1',
    });
    expect(res.json).toHaveBeenCalledWith({ id: 'item-1' });
  });
});
