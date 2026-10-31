import request from 'supertest';
import { app } from '../../../src/app';
import { authHeader, createCart, createUser } from '../../helpers/integrationFixtures';
import prisma from '../../../src/prisma';

describe('GET /meuspedidos', () => {
  it('deve omitir carrinho ainda não finalizado', async () => {
    const user = await createUser();
    await createCart(user.id);
    const response = await request(app).get('/meuspedidos').set(authHeader(user));

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
    expect(await prisma.compra.count({ where: { id_usuario: user.id, status: 'CARRINHO' } })).toBe(1);
  });
});
