import { Prisma } from '@prisma/client';
import prisma from '../../../src/prisma';
import { createCategory, createUser } from '../../helpers/integrationFixtures';

describe('constraints do PostgreSQL de teste', () => {
  it('deve impedir e-mails duplicados', async () => {
    const user = await createUser();

    await expect(
      prisma.usuario.create({
        data: { nome: user.nome, email: user.email, senha: 'another-test-password' },
      }),
    ).rejects.toMatchObject({ code: 'P2002' });
  });

  it('deve rejeitar produto associado a categoria inexistente', async () => {
    const error = await prisma.produto
      .create({
        data: {
          nome: 'Produto inválido',
          preco: new Prisma.Decimal(1),
          unidade: 'un',
          descricao: 'Teste da restrição de chave estrangeira',
          banner: 'https://example.test/image.png',
          id_categoria: '00000000-0000-4000-8000-000000000000',
        },
      })
      .catch((reason: unknown) => reason);

    expect(error).toMatchObject({ code: 'P2003' });
    await expect(createCategory()).resolves.toHaveProperty('id');
  });
});
