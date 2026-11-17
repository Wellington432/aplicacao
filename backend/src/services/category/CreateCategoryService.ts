import prismaClient from '../../prisma';

interface CreateCategoryRequest {
  nome: string;
  iconKey?: string;
}

class CreateCategoryService {
  async execute({ nome, iconKey }: CreateCategoryRequest) {
    if (!nome?.trim()) {
      throw new Error('Dados ausentes!');
    }

    return prismaClient.categoria.create({
      data: {
        nome: nome.trim(),
        iconKey: iconKey?.trim() || null,
      },
      select: { id: true, nome: true, iconKey: true },
    });
  }
}

export { CreateCategoryService };