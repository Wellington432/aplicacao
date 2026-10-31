import request from 'supertest';
import { app } from '../../../src/app';
import prisma from '../../../src/prisma';
import { addCartItem, authHeader, createCart, createCategory, createProduct, createUser } from '../../helpers/integrationFixtures';

describe('DELETE /deletapedido', () => {
  it('deve remover item do carrinho do usuário', async () => {
    const user = await createUser();
    const category = await createCategory();
    const product = await createProduct(category.id);
    const cart = await createCart(user.id);
    const item = await addCartItem(cart.id, product.id);
    const response = await request(app)
      .delete('/deletapedido')
      .set(authHeader(user))
      .send({ id: item.id });

    expect(response.status).toBe(200);
    await expect(prisma.itemCompra.findUnique({ where: { id: item.id } })).resolves.toBeNull();
  });
});
