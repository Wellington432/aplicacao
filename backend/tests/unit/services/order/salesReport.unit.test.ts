import prisma from '../../../../src/prisma';
import { SalesReportService } from '../../../../src/services/order/SalesReportService';

describe('SalesReportService.execute', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('deve agregar receita diária e produtos no período solicitado', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-10-21T12:00:00.000Z'));
    (prisma.compra.findMany as jest.Mock).mockResolvedValue([
      {
        confirmado_em: new Date('2026-10-21T10:00:00.000Z'),
        modificado_em: new Date('2026-10-21T10:00:00.000Z'),
        total: '10.50',
        itens: [{ id_produto: 'prod-1', quantidade: 2, produto: { nome: 'Maçã' } }],
      },
    ]);
    (prisma.compra.count as jest.Mock).mockResolvedValueOnce(1).mockResolvedValueOnce(2);

    const result = await new SalesReportService().execute({ dias: 7 });

    expect(result.periodo_dias).toBe(7);
    expect(result.receita_total).toBe(10.5);
    expect(result.pedidos_finalizados).toBe(1);
    expect(result.pedidos_cancelados).toBe(1);
    expect(result.pedidos_aguardando_pagamento).toBe(2);
    expect(result.produtos_mais_vendidos).toEqual([
      { id_produto: 'prod-1', nome: 'Maçã', quantidade: 2 },
    ]);
    expect(result.receita_por_dia).toHaveLength(7);
  });

  it('deve usar trinta dias para período não permitido', async () => {
    (prisma.compra.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.compra.count as jest.Mock).mockResolvedValue(0);

    const result = await new SalesReportService().execute({ dias: 14 });
    expect(result.periodo_dias).toBe(30);
    expect(result.receita_por_dia).toHaveLength(30);
  });
});
