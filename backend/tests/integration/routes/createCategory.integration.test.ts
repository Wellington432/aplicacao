import request from 'supertest';
import { app } from '../../../src/app';
import prisma from '../../../src/prisma';
import { authHeader, createUser } from '../../helpers/integrationFixtures';

describe('POST /novacategoria', () => {
  it('deve persistir categoria para administrador', async () => {
    const admin = await createUser('ADM');
    const response = await request(app)
      .post('/novacategoria')
      .set(authHeader(admin))
      .send({ nome: 'Categoria integração', iconKey: 'doces' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
    await expect(prisma.categoria.findUnique({ where: { id: response.body.id } })).resolves.toMatchObject({
      iconKey: 'doces',
    });
  });

  it('deve bloquear cliente autenticado', async () => {
    const client = await createUser();
    const response = await request(app)
      .post('/novacategoria')
      .set(authHeader(client))
      .send({ nome: 'Não permitida' });
    expect(response.status).toBe(403);
  });
});
