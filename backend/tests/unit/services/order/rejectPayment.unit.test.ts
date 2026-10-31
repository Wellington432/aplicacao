import prisma from '../../../../src/prisma';
import { RejeitarPagamentoService } from '../../../../src/services/order/RejeitarPagamentoServices';

describe('RejeitarPagamentoService.execute', () => {
  it('deve rejeitar pagamento aguardando confirmação', async () => {
    (prisma.compra.findUnique as jest.Mock).mockResolvedValue({
      status: 'AGUARDANDO_CONFIRMACAO',
    });
    (prisma.compra.update as jest.Mock).mockResolvedValue({ status: 'REJEITADO' });

    await expect(
      new RejeitarPagamentoService().execute({ id: 'cart-1', confirmado_por: 'admin-1' }),
    ).resolves.toEqual({ status: 'REJEITADO' });
    expect(prisma.compra.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'cart-1' },
        data: expect.objectContaining({ status: 'REJEITADO', confirmado_por: 'admin-1' }),
      }),
    );
  });

  it('deve rejeitar pedido inexistente ou em status inválido', async () => {
    (prisma.compra.findUnique as jest.Mock).mockResolvedValueOnce(null);
    await expect(
      new RejeitarPagamentoService().execute({ id: 'cart-1', confirmado_por: 'admin-1' }),
    ).rejects.toThrow('Pedido não encontrado');

    (prisma.compra.findUnique as jest.Mock).mockResolvedValueOnce({ status: 'PAGO' });
    await expect(
      new RejeitarPagamentoService().execute({ id: 'cart-1', confirmado_por: 'admin-1' }),
    ).rejects.toThrow('não está aguardando aprovação');
  });
});
