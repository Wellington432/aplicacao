import request from 'supertest';
import { app } from '../../../src/app';
import { authHeader, createCategory, createProduct, createUser } from '../../helpers/integrationFixtures';

describe('GET /listproduto', () => {
  it('deve listar produto ativo persistido para usuário autenticado', async () => {
    const user = await createUser();
    const category = await createCategory();
    const product = await createProduct(category.id);
    const response = await request(app).get('/listproduto').set(authHeader(user));

    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.arrayContaining([expect.objectContaining({ id: product.id })]));
  });
});
