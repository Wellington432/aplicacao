import prismaClient from '../../prisma';
import { ensureUniqueCategoryName } from './categoryName';

interface CreateCategoryRequest {
  nome: string;
  iconKey?: string | null;
  iconUrl?: string;
}

class CreateCategoryService {
  async execute({ nome, iconKey, iconUrl }: CreateCategoryRequest) {
    if (!nome?.trim()) {
      throw new Error('Dados ausentes!');
    }
    await ensureUniqueCategoryName(nome.trim());

    return prismaClient.categoria.create({
      data: {
        nome: nome.trim(),
        iconKey: iconUrl ? null : iconKey?.trim() || null,
        iconUrl: iconUrl ?? null,
      },
      select: { id: true, nome: true, iconKey: true, iconUrl: true },
    });
  }
}

export { CreateCategoryService };