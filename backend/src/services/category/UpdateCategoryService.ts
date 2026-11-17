import prismaClient from '../../prisma';
import { ensureUniqueCategoryName } from './categoryName';

interface UpdateCategoryRequest {
  id: string;
  nome: string;
  iconKey?: string | null;
  iconUrl?: string;
  removeIcon?: boolean;
}

class UpdateCategoryService {
  async execute({ id, nome, iconKey, iconUrl, removeIcon }: UpdateCategoryRequest) {
    if (!id?.trim() || !nome?.trim()) {
      throw new Error('Dados ausentes!');
    }

    const currentCategory = await prismaClient.categoria.findUniqueOrThrow({
      where: { id: id.trim() },
      select: { id: true, nome: true, iconKey: true, iconUrl: true },
    });
    await ensureUniqueCategoryName(nome.trim(), currentCategory.id);

    const updatedIconUrl = iconUrl
      ?? (removeIcon || iconKey ? null : currentCategory.iconUrl);
    const updatedIconKey = iconUrl
      ? null
      : iconKey !== undefined
        ? iconKey?.trim() || null
        : currentCategory.iconKey;

    const category = await prismaClient.categoria.update({
      where: { id: id.trim() },
      data: {
        nome: nome.trim(),
        iconKey: updatedIconKey,
        iconUrl: updatedIconUrl,
      },
      select: { id: true, nome: true, iconKey: true, iconUrl: true },
    });

    return { category, previousIconUrl: currentCategory.iconUrl };
  }
}

export { UpdateCategoryService };
