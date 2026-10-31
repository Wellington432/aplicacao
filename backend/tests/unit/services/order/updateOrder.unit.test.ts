import prisma from '../../../../src/prisma';
import { UpdateOrderService } from '../../../../src/services/order/UpdateOrderServices';

describe('UpdateOrderService.execute', () => {
  const input = { id: 'item-1', quantidade: 2, user_id: 'user-1' };

  it('deve atualizar quantidade no item do usuário', async () => {
    (prisma.itemCompra.findUnique as jest.Mock).mockResolvedValue({
      compra: { id_usuario: 'user-1', status: 'CARRINHO' },
      produto: { estoque: 5, nome: 'Maçã' },
    });
    (prisma.itemCompra.update as jest.Mock).mockResolvedValue({ ...input });

    await expect(new UpdateOrderService().execute(input)).resolves.toEqual(input);
    expect(prisma.itemCompra.update).toHaveBeenCalledWith({
      where: { id: 'item-1' },
      data: { quantidade: 2 },
    });
  });

  it.each([
    [{ ...input, id: '' }, 'Dados ausentes'],
    [{ ...input, quantidade: 0 }, 'número inteiro maior que zero'],
  ])('deve rejeitar entrada inválida', async (payload, error) => {
    await expect(new UpdateOrderService().execute(payload)).rejects.toThrow(error);
    expect(prisma.itemCompra.findUnique).not.toHaveBeenCalled();
  });

  it('deve negar item inexistente, de outro usuário ou de pedido processado', async () => {
    (prisma.itemCompra.findUnique as jest.Mock).mockResolvedValueOnce(null);
    await expect(new UpdateOrderService().execute(input)).rejects.toThrow('Item não encontrado.');

    (prisma.itemCompra.findUnique as jest.Mock).mockResolvedValueOnce({
      compra: { id_usuario: 'other', status: 'CARRINHO' },
      produto: { estoque: 5, nome: 'Maçã' },
    });
    await expect(new UpdateOrderService().execute(input)).rejects.toThrow('Acesso negado.');

    (prisma.itemCompra.findUnique as jest.Mock).mockResolvedValueOnce({
      compra: { id_usuario: 'user-1', status: 'PAGO' },
      produto: { estoque: 5, nome: 'Maçã' },
    });
    await expect(new UpdateOrderService().execute(input)).rejects.toThrow('já foi processado');
  });

  it('deve impedir quantidade maior que estoque', async () => {
    (prisma.itemCompra.findUnique as jest.Mock).mockResolvedValue({
      compra: { id_usuario: 'user-1', status: 'CARRINHO' },
      produto: { estoque: 1, nome: 'Maçã' },
    });

    await expect(new UpdateOrderService().execute(input)).rejects.toThrow(
      'Só temos 1 unidade(s) de "Maçã" em estoque.',
    );
  });
});
