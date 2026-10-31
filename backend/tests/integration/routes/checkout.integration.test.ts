import request from 'supertest';
import { app } from '../../../src/app';
import prisma from '../../../src/prisma';
import { addCartItem, authHeader, createCart, createCategory, createProduct, createUser } from '../../helpers/integrationFixtures';

describe('POST /checkout', () => {
  it('deve calcular total e persistir status de pagamento', async () => {
    const user = await createUser();
    const category = await createCategory();
    const product = await createProduct(category.id, { preco: 2, estoque: 3 });
    const cart = await createCart(user.id);
    await addCartItem(cart.id, product.id, 2);
    const response = await request(app)
      .post('/checkout')
      .set(authHeader(user))
      .send({ id_compra: cart.id, tipo_entrega: 'RETIRADA' });

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(4);
    await expect(prisma.compra.findUnique({ where: { id: cart.id } })).resolves.toMatchObject({
      status: 'AGUARDANDO_PAGAMENTO',
    });
  });
});
