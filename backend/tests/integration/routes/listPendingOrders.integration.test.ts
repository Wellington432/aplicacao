import request from 'supertest';
import { app } from '../../../src/app';
import { authHeader, createUser } from '../../helpers/integrationFixtures';

describe('GET /pedidospendentes', () => {
  it('deve permitir consulta para administrador e bloquear cliente', async () => {
    const admin = await createUser('ADM');
    const client = await createUser();
    const allowed = await request(app).get('/pedidospendentes').set(authHeader(admin));
    const denied = await request(app).get('/pedidospendentes').set(authHeader(client));

    expect(allowed.status).toBe(200);
    expect(denied.status).toBe(403);
  });
});
