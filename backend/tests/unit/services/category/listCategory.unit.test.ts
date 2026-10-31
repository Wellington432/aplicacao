import { ListCategoryService } from '../../../../src/services/category/ListCategoryService';
import prisma from '../../../../src/prisma';

describe('ListCategoryService.execute', () => {
  it('deve retornar categorias ordenadas pelo nome', async () => {
    const categorias = [{ id: 'category-1', nome: 'Frutas' }];
    (prisma.categoria.findMany as jest.Mock).mockResolvedValue(categorias);

    await expect(new ListCategoryService().execute()).resolves.toBe(categorias);
    expect(prisma.categoria.findMany).toHaveBeenCalledWith({
      select: { id: true, nome: true },
      orderBy: { nome: 'asc' },
    });
  });

  it('deve propagar falha do banco', async () => {
    (prisma.categoria.findMany as jest.Mock).mockRejectedValue(new Error('db error'));
    await expect(new ListCategoryService().execute()).rejects.toThrow('db error');
  });
});
