jest.mock('../../../../src/services/order/CheckoutService', () => ({
  CheckoutService: jest.fn().mockImplementation(() => ({ execute: jest.fn().mockResolvedValue({ total: 10 }) })),
}));

import { CheckoutController } from '../../../../src/controllers/order/CheckoutController';
import { CheckoutService } from '../../../../src/services/order/CheckoutService';
import { createAuthRequest, createResponse } from '../../../helpers/httpMocks';

describe('CheckoutController.handle', () => {
  it('deve passar dados de retirada e usuário autenticado ao serviço', async () => {
    const res = createResponse();
    await new CheckoutController().handle(
      createAuthRequest({ body: { id_compra: 'cart-1', tipo_entrega: 'RETIRADA', endereco: 'inválido' } }),
      res,
    );
    expect((CheckoutService as jest.Mock).mock.results[0].value.execute).toHaveBeenCalledWith({
      id_compra: 'cart-1',
      tipo_entrega: 'RETIRADA',
      endereco: undefined,
      user_id: 'user-1',
    });
    expect(res.json).toHaveBeenCalledWith({ total: 10 });
  });
});
