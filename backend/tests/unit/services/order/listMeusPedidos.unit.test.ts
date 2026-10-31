import prisma from '../../../../src/prisma';
import { ListMeusPedidosService } from '../../../../src/services/order/ListMeusPedidosService';

describe('ListMeusPedidosService.execute', () => {
  it('deve listar somente pedidos processados do usuário', async () => {
    (prisma.compra.findMany as jest.Mock).mockResolvedValue([]);

    await new ListMeusPedidosService().execute({ user_id: 'user-1' });
    expect(prisma.compra.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id_usuario: 'user-1', status: { not: 'CARRINHO' } },
      }),
    );
  });
});
