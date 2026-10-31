jest.mock('../../../../src/services/order/RejeitarPagamentoServices', () => ({
  RejeitarPagamentoService: jest.fn().mockImplementation(() => ({ execute: jest.fn().mockResolvedValue({ status: 'REJEITADO' }) })),
}));

import { RejeitarPagamentoController } from '../../../../src/controllers/order/RejeitarPagamentoController';
import { RejeitarPagamentoService } from '../../../../src/services/order/RejeitarPagamentoServices';
import { createAuthRequest, createResponse } from '../../../helpers/httpMocks';

describe('RejeitarPagamentoController.handle', () => {
  it('deve passar identificador e usuário admin ao serviço', async () => {
    const res = createResponse();
    await new RejeitarPagamentoController().handle(
      createAuthRequest({ params: { id: 'cart-1' } }),
      res,
    );
    expect((RejeitarPagamentoService as jest.Mock).mock.results[0].value.execute).toHaveBeenCalledWith({
      id: 'cart-1',
      confirmado_por: 'user-1',
    });
    expect(res.json).toHaveBeenCalledWith({ status: 'REJEITADO' });
  });
});
