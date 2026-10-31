import request from 'supertest';
import { app } from '../../../src/app';
import prisma from '../../../src/prisma';
import { authHeader, createCategory, createProduct, createUser } from '../../helpers/integrationFixtures';

describe('DELETE /deletaproduto', () => {
  it('deve desativar produto sem removê-lo', async () => {
    const admin = await createUser('ADM');
    const category = await createCategory();
    const product = await createProduct(category.id);
    const response = await request(app)
      .delete('/deletaproduto')
      .set(authHeader(admin))
      .send({ id: product.id });

    expect(response.status).toBe(200);
    await expect(prisma.produto.findUnique({ where: { id: product.id } })).resolves.toMatchObject({
      ativo: false,
    });
  });
});
