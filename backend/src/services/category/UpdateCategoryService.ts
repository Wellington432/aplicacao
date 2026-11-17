import prismaClient from '../../prisma';

interface UpdateCategoryRequest {
  id: string;
  nome: string;
  iconKey?: string | null;
}

class UpdateCategoryService {
  async execute({ id, nome, iconKey }: UpdateCategoryRequest) {
    if (!id?.trim() || !nome?.trim()) {
      throw new Error('Dados ausentes!');
    }

    return prismaClient.categoria.update({
      where: { id: id.trim() },
      data: {
        nome: nome.trim(),
        ...(iconKey !== undefined ? { iconKey: iconKey?.trim() || null } : {}),
      },
      select: { id: true, nome: true, iconKey: true },
    });
  }
}

export { UpdateCategoryService };
