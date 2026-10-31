import { ListProdutoServices } from '../../../../src/services/product/ListProdutoServices';
import prisma from '../../../../src/prisma';

describe('ListProdutoServices.execute', () => {
  it('deve filtrar produtos ativos por categoria e termo', async () => {
    (prisma.produto.findMany as jest.Mock).mockResolvedValue([]);

    await new ListProdutoServices().execute({ id_categoria: 'cat-1', nome: 'pera' });
    expect(prisma.produto.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          ativo: true,
          id_categoria: 'cat-1',
          OR: [
            { nome: { contains: 'pera', mode: 'insensitive' } },
            { descricao: { contains: 'pera', mode: 'insensitive' } },
            { categoria: { nome: { contains: 'pera', mode: 'insensitive' } } },
          ],
        },
        orderBy: { nome: 'asc' },
      }),
    );
  });

  it('deve omitir filtro ativo quando solicitado listar todos', async () => {
    await new ListProdutoServices().execute({ todos: true });
    expect(prisma.produto.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: {} }),
    );
  });
});
