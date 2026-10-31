import request from 'supertest';
import { app } from '../../../src/app';
import { authHeader, createUser } from '../../helpers/integrationFixtures';

describe('GET /listusuario', () => {
  it('deve retornar perfil autenticado sem senha', async () => {
    const user = await createUser();
    const response = await request(app).get('/listusuario').set(authHeader(user));

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ id: user.id, email: user.email });
    expect(response.body).not.toHaveProperty('senha');
  });

  it('deve exigir token', async () => {
    expect((await request(app).get('/listusuario')).status).toBe(401);
  });
});
