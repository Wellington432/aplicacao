jest.mock('../../../../src/services/order/ListMeusPedidosService', () => ({
  ListMeusPedidosService: jest.fn().mockImplementation(() => ({ execute: jest.fn().mockResolvedValue([]) })),
}));

import { ListMeusPedidosController } from '../../../../src/controllers/order/ListMeusPedidosController';
import { ListMeusPedidosService } from '../../../../src/services/order/ListMeusPedidosService';
import { createAuthRequest, createResponse } from '../../../helpers/httpMocks';

describe('ListMeusPedidosController.handle', () => {
  it('deve listar pedidos do usuário autenticado', async () => {
    const res = createResponse();
    await new ListMeusPedidosController().handle(createAuthRequest(), res);
    expect((ListMeusPedidosService as jest.Mock).mock.results[0].value.execute).toHaveBeenCalledWith({
      user_id: 'user-1',
    });
    expect(res.json).toHaveBeenCalledWith([]);
  });
});
