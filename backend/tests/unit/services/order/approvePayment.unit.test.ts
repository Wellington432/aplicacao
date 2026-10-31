import prisma from '../../../../src/prisma';
import { AprovarPagamentoService } from '../../../../src/services/order/AprovarPagamentos';

describe('AprovarPagamentoService.execute', () => {
  const transaction = {
    compra: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    produto: { updateMany: jest.fn() },
  };

  beforeEach(() => {
    transaction.compra.findUnique.mockReset();
    transaction.compra.update.mockReset();
    transaction.produto.updateMany.mockReset();
    (prisma.$transaction as jest.Mock).mockImplementation(
      (callback: (tx: typeof transaction) => unknown) => callback(transaction),
    );
  });

  it('deve baixar estoque e marcar pedido como pago na transação', async () => {
    transaction.compra.findUnique.mockResolvedValue({
      status: 'AGUARDANDO_CONFIRMACAO',
      itens: [{ id_produto: 'product-1', quantidade: 2, produto: { nome: 'Maçã' } }],
    });
    transaction.produto.updateMany.mockResolvedValue({ count: 1 });
    transaction.compra.update.mockResolvedValue({ status: 'PAGO' });

    await expect(
      new AprovarPagamentoService().execute({ id: 'cart-1', confirmado_por: 'admin-1' }),
    ).resolves.toEqual({ status: 'PAGO' });
    expect(transaction.produto.updateMany).toHaveBeenCalledWith({
      where: { id: 'product-1', estoque: { gte: 2 } },
      data: { estoque: { decrement: 2 } },
    });
  });

  it('deve impedir aprovação se pedido não existir ou não aguardar confirmação', async () => {
    transaction.compra.findUnique.mockResolvedValueOnce(null);
    await expect(
      new AprovarPagamentoService().execute({ id: 'cart-1', confirmado_por: 'admin-1' }),
    ).rejects.toThrow('Pedido não encontrado');

    transaction.compra.findUnique.mockResolvedValueOnce({ status: 'PAGO', itens: [] });
    await expect(
      new AprovarPagamentoService().execute({ id: 'cart-1', confirmado_por: 'admin-1' }),
    ).rejects.toThrow('não está aguardando aprovação');
  });

  it('deve abortar a transação quando estoque for insuficiente', async () => {
    transaction.compra.findUnique.mockResolvedValue({
      status: 'AGUARDANDO_CONFIRMACAO',
      itens: [{ id_produto: 'product-1', quantidade: 3, produto: { nome: 'Maçã' } }],
    });
    transaction.produto.updateMany.mockResolvedValue({ count: 0 });

    await expect(
      new AprovarPagamentoService().execute({ id: 'cart-1', confirmado_por: 'admin-1' }),
    ).rejects.toThrow('Estoque insuficiente para "Maçã"');
    expect(transaction.compra.update).not.toHaveBeenCalled();
  });
});
