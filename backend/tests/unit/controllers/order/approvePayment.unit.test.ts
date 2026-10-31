jest.mock('../../../../src/services/order/AprovarPagamentos', () => ({
  AprovarPagamentoService: jest.fn().mockImplementation(() => ({ execute: jest.fn().mockResolvedValue({ status: 'PAGO' }) })),
}));

import { AprovarPagamentoController } from '../../../../src/controllers/order/AprovarPagamentoController';
import { AprovarPagamentoService } from '../../../../src/services/order/AprovarPagamentos';
import { createAuthRequest, createResponse } from '../../../helpers/httpMocks';

describe('AprovarPagamentoController.handle', () => {
  it('deve passar id e administrador autenticado ao serviço', async () => {
    const res = createResponse();
    await new AprovarPagamentoController().handle(
      createAuthRequest({ params: { id: 'cart-1' } }),
      res,
    );
    expect((AprovarPagamentoService as jest.Mock).mock.results[0].value.execute).toHaveBeenCalledWith({
      id: 'cart-1',
      confirmado_por: 'user-1',
    });
    expect(res.json).toHaveBeenCalledWith({ status: 'PAGO' });
  });
});
