import prisma from '../../../../src/prisma';
import { ListPedidosPendentesService } from '../../../../src/services/order/ListPedidosPendentesServices';

describe('ListPedidosPendentesService.execute', () => {
  it('deve consultar pedidos aguardando confirmação ou rejeitados', async () => {
    (prisma.compra.findMany as jest.Mock).mockResolvedValue([]);

    await new ListPedidosPendentesService().execute();
    expect(prisma.compra.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: { in: ['AGUARDANDO_CONFIRMACAO', 'REJEITADO'] } },
      }),
    );
  });
});
