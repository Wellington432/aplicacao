import request from 'supertest';
import { app } from '../../../src/app';
import prisma from '../../../src/prisma';
import { addCartItem, authHeader, createCart, createCategory, createProduct, createUser } from '../../helpers/integrationFixtures';

describe('POST /novopedido', () => {
  it('deve persistir item de pedido com quantidade válida', async () => {
    const user = await createUser();
    const category = await createCategory();
    const product = await createProduct(category.id, { estoque: 5 });
    const cart = await createCart(user.id);
    const response = await request(app)
      .post('/novopedido')
      .set(authHeader(user))
      .send({ id_compra: cart.id, id_produto: product.id, quantidade: 2 });

    expect(response.status).toBe(200);
    await expect(prisma.itemCompra.findFirst({ where: { id_compra: cart.id } })).resolves.toMatchObject({
      quantidade: 2,
    });
  });
});
