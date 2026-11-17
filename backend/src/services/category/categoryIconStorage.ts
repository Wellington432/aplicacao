import fs from 'fs/promises';
import path from 'path';
import { ClientError } from '../../errors/ClientError';

const CATEGORY_ICON_DIRECTORY = path.resolve(__dirname, '../../../uploads/category-icons');

function isSvg(buffer: Buffer): boolean {
  try {
    const source = new TextDecoder('utf-8', { fatal: true })
      .decode(buffer)
      .replace(/^\uFEFF/, '')
      .replace(/<!--[\s\S]*?-->/g, '')
      .trim();
    const root = source.replace(/^<\?xml[\s\S]*?\?>/i, '').trim();
    const rootTag = root.match(/^<svg\b[^>]*>/i)?.[0];
    const hasClosedRoot = rootTag?.endsWith('/>')
      ? root.trim() === rootTag
      : /<\/svg\s*>\s*$/i.test(root);

    return (
      Boolean(rootTag) &&
      hasClosedRoot &&
      !/<!DOCTYPE|<!ENTITY|<\s*(?:script|foreignObject|iframe|object|embed|audio|video)\b|\bon[a-z]+\s*=|@import|url\s*\(\s*['"]?(?:https?:|\/\/|data:|javascript:)|\b(?:href|xlink:href)\s*=\s*['"]\s*(?:https?:|\/\/|data:|javascript:)/i.test(source)
    );
  } catch {
    return false;
  }
}

function hasExpectedContent(buffer: Buffer, mimetype: string): boolean {
  if (mimetype === 'image/png') {
    return buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  }
  if (mimetype === 'image/jpeg') {
    return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }
  if (mimetype === 'image/webp') {
    return buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP';
  }
  return mimetype === 'image/svg+xml' && isSvg(buffer);
}

export async function validateCategoryIconFile(file: Express.Multer.File): Promise<void> {
  const buffer = await fs.readFile(file.path);
  if (!hasExpectedContent(buffer, file.mimetype)) {
    throw new ClientError('O conteúdo do arquivo não corresponde a PNG, JPG, WEBP ou SVG válido.');
  }
}

export async function removeUploadedCategoryIcon(filePath: string): Promise<void> {
  const resolvedPath = path.resolve(filePath);
  const relativePath = path.relative(CATEGORY_ICON_DIRECTORY, resolvedPath);
  if (!relativePath || relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    throw new Error('O arquivo enviado não está na pasta de ícones de categoria.');
  }

  await fs.unlink(resolvedPath).catch((error: NodeJS.ErrnoException) => {
    if (error.code !== 'ENOENT') throw error;
  });
}

export async function removeCategoryIcon(iconUrl: string | null | undefined): Promise<void> {
  if (!iconUrl) return;

  let pathname: string;
  try {
    pathname = new URL(iconUrl).pathname;
  } catch {
    return;
  }

  const match = pathname.match(/^\/uploads\/category-icons\/([0-9a-f-]{36}\.(?:png|jpg|webp|svg))$/i);
  if (!match) return;

  await removeUploadedCategoryIcon(path.join(CATEGORY_ICON_DIRECTORY, match[1]));
}
