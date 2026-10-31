import request from 'supertest';
import { app } from '../../../src/app';
import { authHeader, createCart, createUser } from '../../helpers/integrationFixtures';
import prisma from '../../../src/prisma';

describe('GET /checkout/:compraId/qrcode', () => {
  it('deve negar geração do QR Code para pedido de outro usuário', async () => {
    const owner = await createUser();
    const other = await createUser();
    const cart = await createCart(owner.id, 'AGUARDANDO_PAGAMENTO');
    await prisma.compra.update({ where: { id: cart.id }, data: { total: 10 } });
    const response = await request(app)
      .get(`/checkout/${cart.id}/qrcode`)
      .set(authHeader(other));

    expect(response.status).toBe(403);
  });
});
