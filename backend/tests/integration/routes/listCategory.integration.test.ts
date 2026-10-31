import request from 'supertest';
import { app } from '../../../src/app';
import { authHeader, createCategory, createUser } from '../../helpers/integrationFixtures';

describe('GET /listcategoria', () => {
  it('deve retornar categorias para usuário autenticado', async () => {
    const user = await createUser();
    const category = await createCategory();
    const response = await request(app).get('/listcategoria').set(authHeader(user));

    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.arrayContaining([expect.objectContaining({ id: category.id })]));
  });
});
