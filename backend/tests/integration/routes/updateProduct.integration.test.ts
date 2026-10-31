import request from 'supertest';
import { app } from '../../../src/app';
import prisma from '../../../src/prisma';
import { authHeader, createCategory, createProduct, createUser } from '../../helpers/integrationFixtures';

describe('PUT /atualizaproduto', () => {
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  it('deve persistir alterações de produto para administrador', async () => {
    const admin = await createUser('ADM');
    const category = await createCategory();
    const product = await createProduct(category.id);
    const response = await request(app)
      .put('/atualizaproduto')
      .set(authHeader(admin))
      .send({
        id: product.id,
        nome: 'Produto atualizado',
        preco: 4,
        unidade: 'un',
        descricao: 'Atualizado',
        id_categoria: category.id,
        estoque: 3,
        ativo: false,
      });

    expect(response.status).toBe(200);
    await expect(prisma.produto.findUnique({ where: { id: product.id } })).resolves.toMatchObject({
      nome: 'Produto atualizado',
      ativo: false,
    });
  });

  it('deve retornar 404 ao tentar atualizar produto inexistente', async () => {
    const admin = await createUser('ADM');
    const response = await request(app)
      .put('/atualizaproduto')
      .set(authHeader(admin))
      .send({
        id: 'missing-product',
        nome: 'Produto atualizado',
        preco: 4,
        unidade: 'un',
        descricao: 'Atualizado',
        id_categoria: '00000000-0000-4000-8000-000000000000',
        estoque: 3,
      });

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Registro não encontrado.');
    expect(errorSpy).not.toHaveBeenCalled();
  });
});
