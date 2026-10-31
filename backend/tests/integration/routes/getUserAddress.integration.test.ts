import request from 'supertest';
import { app } from '../../../src/app';
import { authHeader, createUser } from '../../helpers/integrationFixtures';

describe('GET /endereco/usuario/:userId', () => {
  it('deve retornar endereço do próprio usuário autenticado', async () => {
    const user = await createUser();
    const response = await request(app)
      .get(`/endereco/usuario/${user.id}`)
      .set(authHeader(user));

    expect(response.status).toBe(200);
    expect(response.body).toBeNull();
  });

  it('deve negar consulta de endereço de outro usuário', async () => {
    const user = await createUser();
    const response = await request(app)
      .get('/endereco/usuario/other-user')
      .set(authHeader(user));
    expect(response.status).toBe(403);
  });
});
