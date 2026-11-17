import { CreateCategoryService } from '../../../../src/services/category/CreateCategoryService';
import prisma from '../../../../src/prisma';

describe('CreateCategoryService.execute', () => {
  it('deve criar categoria com o nome informado', async () => {
    (prisma.categoria.create as jest.Mock).mockResolvedValue({ id: 'category-1' });

    await expect(new CreateCategoryService().execute({ nome: ' Frutas ', iconKey: 'frutas' })).resolves.toEqual({
      id: 'category-1',
    });
    expect(prisma.categoria.create).toHaveBeenCalledWith({
      data: { nome: 'Frutas', iconKey: 'frutas' },
      select: { id: true, nome: true, iconKey: true },
    });
  });

  it('deve rejeitar nome ausente', async () => {
    await expect(new CreateCategoryService().execute({ nome: '' })).rejects.toThrow(
      'Dados ausentes!',
    );
    expect(prisma.categoria.create).not.toHaveBeenCalled();
  });

  it('deve aceitar categoria sem ícone para manter compatibilidade com clientes antigos', async () => {
    (prisma.categoria.create as jest.Mock).mockResolvedValue({ id: 'category-1' });
    await new CreateCategoryService().execute({ nome: 'Frutas' });

    expect(prisma.categoria.create).toHaveBeenCalledWith({
      data: { nome: 'Frutas', iconKey: null },
      select: { id: true, nome: true, iconKey: true },
    });
  });

  it('deve propagar erro do Prisma', async () => {
    (prisma.categoria.create as jest.Mock).mockRejectedValue(new Error('falha de banco'));

    await expect(new CreateCategoryService().execute({ nome: 'Frutas' })).rejects.toThrow(
      'falha de banco',
    );
  });
});
