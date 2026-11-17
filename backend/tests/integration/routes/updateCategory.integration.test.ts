import request from 'supertest';
import fs from 'fs/promises';
import path from 'path';
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

  it('deve salvar, trocar e remover ícones enviados e os arquivos antigos', async () => {
    const admin = await createUser('ADM');
    const svg = (color: string) => Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"><rect width="8" height="8" fill="${color}"/></svg>`,
    );
    const created = await request(app)
      .post('/novacategoria')
      .set(authHeader(admin))
      .field('nome', 'Geleia artesanal')
      .attach('icon', svg('#c44'), { filename: 'icon.svg', contentType: 'image/svg+xml' });

    expect(created.status).toBe(200);
    expect(created.body.iconUrl).toContain('/uploads/category-icons/');
    const firstPath = new URL(created.body.iconUrl).pathname;
    const firstFile = path.resolve(__dirname, '../../../uploads/category-icons', path.basename(firstPath));
    await expect(fs.stat(firstFile)).resolves.toBeTruthy();
    await request(app).get(firstPath).expect(200);

    const replaced = await request(app)
      .put('/atualizacategoria')
      .set(authHeader(admin))
      .field('id', created.body.id)
      .field('nome', 'Geleia artesanal')
      .attach('icon', svg('#4a6'), { filename: 'new-icon.svg', contentType: 'image/svg+xml' });

    expect(replaced.status).toBe(200);
    expect(replaced.body.iconUrl).not.toBe(created.body.iconUrl);
    await expect(fs.stat(firstFile)).rejects.toMatchObject({ code: 'ENOENT' });

    const newPath = new URL(replaced.body.iconUrl).pathname;
    const newFile = path.resolve(__dirname, '../../../uploads/category-icons', path.basename(newPath));
    const removed = await request(app)
      .put('/atualizacategoria')
      .set(authHeader(admin))
      .send({ id: created.body.id, nome: 'Geleia artesanal', iconKey: null, removeIcon: true });

    expect(removed.status).toBe(200);
    expect(removed.body.iconUrl).toBeNull();
    await expect(fs.stat(newFile)).rejects.toMatchObject({ code: 'ENOENT' });
  });
});
