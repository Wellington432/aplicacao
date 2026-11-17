import { CreateCategoryService } from '../../../../src/services/category/CreateCategoryService';
import prisma from '../../../../src/prisma';

describe('CreateCategoryService.execute', () => {
  it('deve criar categoria com o nome informado', async () => {
    (prisma.categoria.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.categoria.create as jest.Mock).mockResolvedValue({ id: 'category-1' });

    await expect(new CreateCategoryService().execute({ nome: ' Frutas ', iconKey: 'frutas' })).resolves.toEqual({
      id: 'category-1',
    });
    expect(prisma.categoria.create).toHaveBeenCalledWith({
      data: { nome: 'Frutas', iconKey: 'frutas', iconUrl: null },
      select: { id: true, nome: true, iconKey: true, iconUrl: true },
    });
  });

  it('deve rejeitar nome ausente', async () => {
    await expect(new CreateCategoryService().execute({ nome: '' })).rejects.toThrow(
      'Dados ausentes!',
    );
    expect(prisma.categoria.create).not.toHaveBeenCalled();
  });

  it('deve aceitar categoria sem ícone para manter compatibilidade com clientes antigos', async () => {
    (prisma.categoria.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.categoria.create as jest.Mock).mockResolvedValue({ id: 'category-1' });
    await new CreateCategoryService().execute({ nome: 'Frutas' });

    expect(prisma.categoria.create).toHaveBeenCalledWith({
      data: { nome: 'Frutas', iconKey: null, iconUrl: null },
      select: { id: true, nome: true, iconKey: true, iconUrl: true },
    });
  });

  it('deve rejeitar categoria duplicada ignorando acentos e caixa', async () => {
    (prisma.categoria.findMany as jest.Mock).mockResolvedValue([
      { id: 'category-existing', nome: 'Café' },
    ]);

    await expect(new CreateCategoryService().execute({ nome: 'CAFE' })).rejects.toThrow(
      'Já existe uma categoria',
    );
    expect(prisma.categoria.create).not.toHaveBeenCalled();
  });

  it('deve salvar ícone enviado e limpar iconKey', async () => {
    (prisma.categoria.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.categoria.create as jest.Mock).mockResolvedValue({ id: 'category-1' });

    await new CreateCategoryService().execute({
      nome: 'Doces da casa',
      iconKey: 'doces',
      iconUrl: 'https://api.example.test/uploads/category-icons/icon.svg',
    });

    expect(prisma.categoria.create).toHaveBeenCalledWith({
      data: {
        nome: 'Doces da casa',
        iconKey: null,
        iconUrl: 'https://api.example.test/uploads/category-icons/icon.svg',
      },
      select: { id: true, nome: true, iconKey: true, iconUrl: true },
    });
  });

  it('deve propagar erro do Prisma', async () => {
    (prisma.categoria.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.categoria.create as jest.Mock).mockRejectedValue(new Error('falha de banco'));

    await expect(new CreateCategoryService().execute({ nome: 'Frutas' })).rejects.toThrow(
      'falha de banco',
    );
  });
});
