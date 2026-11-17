import request from 'supertest';
import { app } from '../../../src/app';
import prisma from '../../../src/prisma';
import { authHeader, createCategory, createUser } from '../../helpers/integrationFixtures';

describe('PUT /atualizacategoria', () => {
  it('deve persistir nome e ícone de categoria para administrador', async () => {
    const admin = await createUser('ADM');
    const category = await createCategory();
    const response = await request(app)
      .put('/atualizacategoria')
      .set(authHeader(admin))
      .send({ id: category.id, nome: 'Doces', iconKey: 'doces' });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ id: category.id, nome: 'Doces', iconKey: 'doces' });
    await expect(prisma.categoria.findUnique({ where: { id: category.id } })).resolves.toMatchObject({
      nome: 'Doces',
      iconKey: 'doces',
    });
  });

  it('deve bloquear cliente autenticado', async () => {
    const client = await createUser();
    const category = await createCategory();
    const response = await request(app)
      .put('/atualizacategoria')
      .set(authHeader(client))
      .send({ id: category.id, nome: 'Não permitida', iconKey: 'doces' });

    expect(response.status).toBe(403);
  });
});
