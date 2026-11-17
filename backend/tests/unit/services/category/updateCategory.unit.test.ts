import { UpdateCategoryService } from '../../../../src/services/category/UpdateCategoryService';
import prisma from '../../../../src/prisma';

describe('UpdateCategoryService.execute', () => {
  it('deve trocar um ícone enviado por um ícone pronto', async () => {
    (prisma.categoria.findUniqueOrThrow as jest.Mock).mockResolvedValue({
      id: 'category-1',
      nome: 'Doces',
      iconKey: null,
      iconUrl: 'https://api.example.test/uploads/category-icons/old.svg',
    });
    (prisma.categoria.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.categoria.update as jest.Mock).mockResolvedValue({
      id: 'category-1',
      nome: 'Doces',
      iconKey: 'doces',
      iconUrl: null,
    });

    await expect(
      new UpdateCategoryService().execute({ id: 'category-1', nome: 'Doces', iconKey: 'doces' }),
    ).resolves.toMatchObject({
      category: { iconKey: 'doces', iconUrl: null },
      previousIconUrl: 'https://api.example.test/uploads/category-icons/old.svg',
    });
    expect(prisma.categoria.update).toHaveBeenCalledWith({
      where: { id: 'category-1' },
      data: { nome: 'Doces', iconKey: 'doces', iconUrl: null },
      select: { id: true, nome: true, iconKey: true, iconUrl: true },
    });
  });

  it('deve remover a URL mantendo a categoria disponível para inferência pelo nome', async () => {
    (prisma.categoria.findUniqueOrThrow as jest.Mock).mockResolvedValue({
      id: 'category-1',
      nome: 'Doces',
      iconKey: null,
      iconUrl: 'https://api.example.test/uploads/category-icons/old.svg',
    });
    (prisma.categoria.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.categoria.update as jest.Mock).mockResolvedValue({
      id: 'category-1',
      nome: 'Doces',
      iconKey: null,
      iconUrl: null,
    });

    await new UpdateCategoryService().execute({
      id: 'category-1',
      nome: 'Doces',
      iconKey: null,
      removeIcon: true,
    });

    expect(prisma.categoria.update).toHaveBeenCalledWith({
      where: { id: 'category-1' },
      data: { nome: 'Doces', iconKey: null, iconUrl: null },
      select: { id: true, nome: true, iconKey: true, iconUrl: true },
    });
  });
});
