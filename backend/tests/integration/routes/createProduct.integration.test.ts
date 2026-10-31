import request from 'supertest';
import { app } from '../../../src/app';
import prisma from '../../../src/prisma';
import { authHeader, createCategory, createUser } from '../../helpers/integrationFixtures';

describe('POST /novoproduto', () => {
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  it('deve salvar produto e imagem enviada por administrador', async () => {
    const admin = await createUser('ADM');
    const category = await createCategory();
    const response = await request(app)
      .post('/novoproduto')
      .set(authHeader(admin))
      .field('nome', 'Produto teste upload')
      .field('preco', '1.50')
      .field('unidade', 'un')
      .field('descricao', 'Imagem para teste')
      .field('id_categoria', category.id)
      .attach('banner', Buffer.from('fake-png-content'), {
        filename: 'image.png',
        contentType: 'image/png',
      });

    expect(response.status).toBe(200);
    expect(response.body.banner).toContain('/uploads/');
    await expect(prisma.produto.findUnique({ where: { id: response.body.id } })).resolves.toBeTruthy();
  });

  it('deve rejeitar formato de arquivo que não seja imagem suportada', async () => {
    const admin = await createUser('ADM');
    const response = await request(app)
      .post('/novoproduto')
      .set(authHeader(admin))
      .attach('banner', Buffer.from('not-an-image'), {
        filename: 'payload.txt',
        contentType: 'text/plain',
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Tipo de arquivo não suportado');
    expect(errorSpy).not.toHaveBeenCalled();
  });
});
