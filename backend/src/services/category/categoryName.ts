import prismaClient from '../../prisma';
import { ClientError } from '../../errors/ClientError';

export function normalizeCategoryName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

export async function ensureUniqueCategoryName(name: string, exceptId?: string): Promise<void> {
  const categories = await prismaClient.categoria.findMany({
    select: { id: true, nome: true },
  });
  const normalizedName = normalizeCategoryName(name);
  const duplicate = categories.some(
    (category) => category.id !== exceptId && normalizeCategoryName(category.nome) === normalizedName,
  );

  if (duplicate) {
    throw new ClientError('Já existe uma categoria com esse nome, sem considerar acentos ou maiúsculas.');
  }
}
