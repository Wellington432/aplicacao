import prisma from '../../../../src/prisma';
import { DeleteOrderServices } from '../../../../src/services/order/DeletOrderServices';

describe('DeleteOrderServices.execute', () => {
  it('deve excluir item do carrinho pertencente ao usuário', async () => {
    (prisma.itemCompra.findUnique as jest.Mock).mockResolvedValue({
      compra: { id_usuario: 'user-1', status: 'CARRINHO' },
    });
    (prisma.itemCompra.delete as jest.Mock).mockResolvedValue({ id: 'item-1' });

    await expect(
      new DeleteOrderServices().execute({ id: 'item-1', user_id: 'user-1' }),
    ).resolves.toEqual({ id: 'item-1' });
    expect(prisma.itemCompra.delete).toHaveBeenCalledWith({ where: { id: 'item-1' } });
  });

  it('deve rejeitar id ausente, item inexistente e acesso indevido', async () => {
    const service = new DeleteOrderServices();
    await expect(service.execute({ id: '', user_id: 'user-1' })).rejects.toThrow('Dados ausentes');
    (prisma.itemCompra.findUnique as jest.Mock).mockResolvedValueOnce(null);
    await expect(service.execute({ id: 'item-1', user_id: 'user-1' })).rejects.toThrow(
      'Item não encontrado.',
    );
    (prisma.itemCompra.findUnique as jest.Mock).mockResolvedValueOnce({
      compra: { id_usuario: 'other', status: 'CARRINHO' },
    });
    await expect(service.execute({ id: 'item-1', user_id: 'user-1' })).rejects.toThrow(
      'Acesso negado.',
    );
  });

  it('deve impedir exclusão após processamento do pedido', async () => {
    (prisma.itemCompra.findUnique as jest.Mock).mockResolvedValue({
      compra: { id_usuario: 'user-1', status: 'PAGO' },
    });
    await expect(
      new DeleteOrderServices().execute({ id: 'item-1', user_id: 'user-1' }),
    ).rejects.toThrow('Este pedido já foi processado.');
  });
});
