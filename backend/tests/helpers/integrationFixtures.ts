import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { Prisma, StatusCompra, TipoUsuario } from '@prisma/client';
import { hash } from 'bcryptjs';
import prismaClient from '../../src/prisma';
import { gerarToken } from '../../src/utils/token';
import { COMPROVANTES_DIR } from '../../src/middlewares/multerConfig';

const uploadDir = path.resolve(__dirname, '../../uploads');

export async function createUser(tipo: TipoUsuario = 'CLIENTE') {
  const password = 'test-password-123';
  const user = await prismaClient.usuario.create({
    data: {
      nome: 'Usuário de teste',
      email: `user-${randomUUID()}@example.test`,
      senha: await hash(password, 4),
      tipo,
    },
  });
  return { ...user, password };
}

export function authHeader(user: { id: string; nome: string; email: string }) {
  return { Authorization: `Bearer ${gerarToken(user)}` };
}

export async function createCategory(nome = `Categoria ${randomUUID()}`) {
  return prismaClient.categoria.create({ data: { nome } });
}

export async function createProduct(
  id_categoria: string,
  overrides: Partial<Prisma.ProdutoUncheckedCreateInput> = {},
) {
  return prismaClient.produto.create({
    data: {
      nome: `Produto ${randomUUID()}`,
      preco: 2.5,
      unidade: 'un',
      descricao: 'Produto de teste',
      banner: 'https://example.test/banner.png',
      estoque: 10,
      id_categoria,
      ...overrides,
    },
  });
}

export async function createCart(id_usuario: string, status: StatusCompra = 'CARRINHO') {
  return prismaClient.compra.create({ data: { id_usuario, status } });
}

export async function addCartItem(id_compra: string, id_produto: string, quantidade = 1) {
  return prismaClient.itemCompra.create({ data: { id_compra, id_produto, quantidade } });
}

async function removeStoredFile(directory: string, url?: string | null) {
  if (!url) return;
  const filename = path.basename(url);
  if (!/^[a-f0-9-]{36}\.(png|jpg|webp|gif|pdf)$/i.test(filename)) return;
  try {
    await fs.unlink(path.join(directory, filename));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
  }
}

export async function cleanTestDatabase() {
  const [products, purchases] = await Promise.all([
    prismaClient.produto.findMany({ select: { banner: true } }),
    prismaClient.compra.findMany({ select: { comprovante_url: true } }),
  ]);

  await Promise.all([
    ...products.map((product) => removeStoredFile(uploadDir, product.banner)),
    ...purchases.map((purchase) => removeStoredFile(COMPROVANTES_DIR, purchase.comprovante_url)),
  ]);

  await prismaClient.itemCompra.deleteMany();
  await prismaClient.compra.deleteMany();
  await prismaClient.recuperacaoSenha.deleteMany();
  await prismaClient.endereco.deleteMany();
  await prismaClient.produto.deleteMany();
  await prismaClient.categoria.deleteMany();
  await prismaClient.usuario.deleteMany();
}
