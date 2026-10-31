import prisma from '../../../../src/prisma';
import { CreateOrderService } from '../../../../src/services/order/CreateOrderSerivices';

describe('CreateOrderService.execute', () => {
  const input = {
    id_compra: 'cart-1',
    id_produto: 'product-1',
    quantidade: 2,
    user_id: 'user-1',
  };

  beforeEach(() => {
    (prisma.compra.findUnique as jest.Mock).mockResolvedValue({
      id_usuario: 'user-1',
      status: 'CARRINHO',
    });
    (prisma.produto.findUnique as jest.Mock).mockResolvedValue({
      ativo: true,
      estoque: 4,
      nome: 'Maçã',
    });
    (prisma.itemCompra.findFirst as jest.Mock).mockResolvedValue(null);
  });

  it('deve criar item se produto ainda não estiver no carrinho', async () => {
    (prisma.itemCompra.create as jest.Mock).mockResolvedValue({ id: 'item-1' });

    await expect(new CreateOrderService().execute(input)).resolves.toEqual({ id: 'item-1' });
    expect(prisma.itemCompra.create).toHaveBeenCalledWith({
      data: { quantidade: 2, id_compra: 'cart-1', id_produto: 'product-1' },
    });
  });

  it('deve incrementar quantidade de item existente', async () => {
    (prisma.itemCompra.findFirst as jest.Mock).mockResolvedValue({
      id: 'item-1',
      quantidade: 1,
    });
    (prisma.itemCompra.update as jest.Mock).mockResolvedValue({ quantidade: 3 });

    await expect(new CreateOrderService().execute(input)).resolves.toEqual({ quantidade: 3 });
    expect(prisma.itemCompra.update).toHaveBeenCalledWith({
      where: { id: 'item-1' },
      data: { quantidade: 3 },
    });
  });

  it.each([
    [{ ...input, quantidade: 0 }, 'Dados ausentes'],
    [{ ...input, quantidade: 1.5 }, 'número inteiro maior que zero'],
  ])('deve rejeitar quantidade inválida', async (payload, error) => {
    await expect(new CreateOrderService().execute(payload)).rejects.toThrow(error);
    expect(prisma.compra.findUnique).not.toHaveBeenCalled();
  });

  it('deve rejeitar carrinho de outro usuário ou já processado', async () => {
    (prisma.compra.findUnique as jest.Mock).mockResolvedValueOnce({
      id_usuario: 'other-user',
      status: 'CARRINHO',
    });
    await expect(new CreateOrderService().execute(input)).rejects.toThrow('Acesso negado.');

    (prisma.compra.findUnique as jest.Mock).mockResolvedValueOnce({
      id_usuario: 'user-1',
      status: 'PAGO',
    });
    await expect(new CreateOrderService().execute(input)).rejects.toThrow('já foi processado');
  });

  it('deve impedir produto indisponível e estoque insuficiente', async () => {
    (prisma.produto.findUnique as jest.Mock).mockResolvedValueOnce({
      ativo: false,
      estoque: 4,
      nome: 'Maçã',
    });
    await expect(new CreateOrderService().execute(input)).rejects.toThrow('Produto indisponível.');

    (prisma.produto.findUnique as jest.Mock).mockResolvedValueOnce({
      ativo: true,
      estoque: 1,
      nome: 'Maçã',
    });
    await expect(new CreateOrderService().execute(input)).rejects.toThrow('Só temos 1 unidade');
  });
});
