import request from 'supertest';
import { app } from '../../../src/app';
import prisma from '../../../src/prisma';
import { authHeader, createUser } from '../../helpers/integrationFixtures';

describe('GET /carrinho', () => {
  it('deve criar e persistir carrinho para usuário autenticado', async () => {
    const user = await createUser();
    const response = await request(app).get('/carrinho').set(authHeader(user));

    expect(response.status).toBe(200);
    expect(response.body.id_usuario).toBe(user.id);
    await expect(prisma.compra.findUnique({ where: { id: response.body.id } })).resolves.toBeTruthy();
  });
});
