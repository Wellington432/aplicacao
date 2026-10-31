import prisma from '../../../../src/prisma';
import { GetOrCreateCartService } from '../../../../src/services/order/GetOrCreateCartService';

describe('GetOrCreateCartService.execute', () => {
  it('deve retornar o carrinho existente', async () => {
    const cart = { id: 'cart-1' };
    (prisma.compra.findFirst as jest.Mock).mockResolvedValue(cart);

    await expect(new GetOrCreateCartService().execute({ user_id: 'user-1' })).resolves.toBe(cart);
    expect(prisma.compra.create).not.toHaveBeenCalled();
  });

  it('deve criar carrinho quando usuário não possui um aberto', async () => {
    (prisma.compra.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.compra.create as jest.Mock).mockResolvedValue({ id: 'cart-new' });

    await expect(new GetOrCreateCartService().execute({ user_id: 'user-1' })).resolves.toEqual({
      id: 'cart-new',
    });
    expect(prisma.compra.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: { id_usuario: 'user-1' } }),
    );
  });
});
