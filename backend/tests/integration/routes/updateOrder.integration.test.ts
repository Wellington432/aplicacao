import request from 'supertest';
import { app } from '../../../src/app';
import prisma from '../../../src/prisma';
import { addCartItem, authHeader, createCart, createCategory, createProduct, createUser } from '../../helpers/integrationFixtures';

describe('PUT /atualizapedido', () => {
  it('deve atualizar quantidade de item do carrinho', async () => {
    const user = await createUser();
    const category = await createCategory();
    const product = await createProduct(category.id, { estoque: 6 });
    const cart = await createCart(user.id);
    const item = await addCartItem(cart.id, product.id);
    const response = await request(app)
      .put('/atualizapedido')
      .set(authHeader(user))
      .send({ id: item.id, quantidade: 4 });

    expect(response.status).toBe(200);
    await expect(prisma.itemCompra.findUnique({ where: { id: item.id } })).resolves.toMatchObject({
      quantidade: 4,
    });
  });
});
