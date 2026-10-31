jest.mock('../../../../src/services/order/ListPedidosPendentesServices', () => ({
  ListPedidosPendentesService: jest.fn().mockImplementation(() => ({ execute: jest.fn().mockResolvedValue([]) })),
}));

import { ListPedidosPendentesController } from '../../../../src/controllers/order/ListPedidosPendentesController';
import { createRequest, createResponse } from '../../../helpers/httpMocks';

describe('ListPedidosPendentesController.handle', () => {
  it('deve retornar a lista de pedidos pendentes', async () => {
    const res = createResponse();
    await new ListPedidosPendentesController().handle(createRequest(), res);
    expect(res.json).toHaveBeenCalledWith([]);
  });
});
