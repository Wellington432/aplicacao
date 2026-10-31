import request from 'supertest';
import { app } from '../../../src/app';
import prisma from '../../../src/prisma';
import { addCartItem, authHeader, createCategory, createProduct, createUser } from '../../helpers/integrationFixtures';

describe('PATCH /aprovarpagamento/:id', () => {
  it('deve aprovar pedido e baixar estoque em persistência real', async () => {
    const admin = await createUser('ADM');
    const owner = await createUser();
    const category = await createCategory();
    const product = await createProduct(category.id, { estoque: 4 });
    const order = await prisma.compra.create({
      data: { id_usuario: owner.id, status: 'AGUARDANDO_CONFIRMACAO' },
    });
    await addCartItem(order.id, product.id, 2);

    const response = await request(app)
      .patch(`/aprovarpagamento/${order.id}`)
      .set(authHeader(admin));

    expect(response.status).toBe(200);
    await expect(prisma.compra.findUnique({ where: { id: order.id } })).resolves.toMatchObject({
      status: 'PAGO',
    });
    await expect(prisma.produto.findUnique({ where: { id: product.id } })).resolves.toMatchObject({
      estoque: 2,
    });
  });
});
