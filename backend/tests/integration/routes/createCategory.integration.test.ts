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

  it('deve rejeitar nomes duplicados ignorando acentos e maiúsculas', async () => {
    const admin = await createUser('ADM');
    await request(app)
      .post('/novacategoria')
      .set(authHeader(admin))
      .send({ nome: 'Café colonial', iconKey: 'doces' })
      .expect(200);

    const response = await request(app)
      .post('/novacategoria')
      .set(authHeader(admin))
      .send({ nome: 'CAFE COLONIAL', iconKey: 'doces' });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Já existe uma categoria');
  });

  it('deve validar o conteúdo real e o limite do arquivo enviado', async () => {
    const admin = await createUser('ADM');
    const invalidContent = await request(app)
      .post('/novacategoria')
      .set(authHeader(admin))
      .field('nome', 'Ícone inválido')
      .attach('icon', Buffer.from('<svg><circle/></'), {
        filename: 'icon.svg',
        contentType: 'image/svg+xml',
      });

    expect(invalidContent.status).toBe(400);
    expect(invalidContent.body.error).toContain('conteúdo do arquivo');

    const oversized = await request(app)
      .post('/novacategoria')
      .set(authHeader(admin))
      .field('nome', 'Ícone grande')
      .attach('icon', Buffer.alloc(1024 * 1024 + 1), {
        filename: 'icon.png',
        contentType: 'image/png',
      });

    expect(oversized.status).toBe(400);
    expect(oversized.body.error).toContain('1 MB');
  });
});
