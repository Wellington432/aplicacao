import request from 'supertest';
import { app } from '../../../src/app';
import prisma from '../../../src/prisma';
import { authHeader, createCart, createUser } from '../../helpers/integrationFixtures';

describe('POST /checkout/:id_compra/comprovante', () => {
  it('deve armazenar comprovante e atualizar status do pedido', async () => {
    const user = await createUser();
    const cart = await createCart(user.id, 'AGUARDANDO_PAGAMENTO');
    const response = await request(app)
      .post(`/checkout/${cart.id}/comprovante`)
      .set(authHeader(user))
      .attach('comprovante', Buffer.from('%PDF-test'), {
        filename: 'receipt.pdf',
        contentType: 'application/pdf',
      });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('AGUARDANDO_CONFIRMACAO');
    await expect(prisma.compra.findUnique({ where: { id: cart.id } })).resolves.toMatchObject({
      status: 'AGUARDANDO_CONFIRMACAO',
    });
  });
});
