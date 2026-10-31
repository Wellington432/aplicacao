jest.mock('mercadopago', () => ({
  MercadoPagoConfig: jest.fn(),
  Payment: jest.fn().mockImplementation(() => ({
    get: jest.fn().mockResolvedValue({
      external_reference: 'cart-1',
      status: 'approved',
    }),
  })),
}));

import prisma from '../../../../src/prisma';
import { WebhookMercadoPagoService } from '../../../../src/services/order/WebhookMercadoPagoService';

describe('WebhookMercadoPagoService.execute', () => {
  const oldToken = process.env.MP_ACCESS_TOKEN;

  afterAll(() => {
    if (oldToken === undefined) delete process.env.MP_ACCESS_TOKEN;
    else process.env.MP_ACCESS_TOKEN = oldToken;
  });

  it('deve ignorar tipo de notificação que não seja payment', async () => {
    await expect(
      new WebhookMercadoPagoService().execute({ type: 'order', data_id: '1' }),
    ).resolves.toBeUndefined();
    expect(prisma.compra.update).not.toHaveBeenCalled();
  });

  it('deve rejeitar falta de configuração do Mercado Pago', async () => {
    delete process.env.MP_ACCESS_TOKEN;
    await expect(
      new WebhookMercadoPagoService().execute({ type: 'payment', data_id: '1' }),
    ).rejects.toThrow('Configuração do Mercado Pago ausente.');
  });

  it('deve marcar pagamento aprovado como pago', async () => {
    process.env.MP_ACCESS_TOKEN = 'token-local-teste';
    await new WebhookMercadoPagoService().execute({ type: 'payment', data_id: 'payment-1' });
    expect(prisma.compra.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'cart-1' },
        data: expect.objectContaining({ status: 'PAGO', forma_pagamento: 'MERCADO_PAGO' }),
      }),
    );
  });
});
