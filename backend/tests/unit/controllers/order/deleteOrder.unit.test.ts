jest.mock('../../../../src/services/order/DeletOrderServices', () => ({
  DeleteOrderServices: jest.fn().mockImplementation(() => ({ execute: jest.fn().mockResolvedValue(undefined) })),
}));

import { DeleteOrderController } from '../../../../src/controllers/order/DeletOrderController';
import { createAuthRequest, createResponse } from '../../../helpers/httpMocks';

describe('DeleteOrderController.handle', () => {
  it('deve remover item do pedido autenticado e responder sucesso', async () => {
    const res = createResponse();
    await new DeleteOrderController().handle(createAuthRequest({ body: { id: 'item-1' } }), res);
    expect(res.json).toHaveBeenCalledWith({ message: 'Pedido deletado com sucesso' });
  });
});
