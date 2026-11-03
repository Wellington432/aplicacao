import { Request } from 'express';
import { isCloudinaryConfigured, uploadImage } from './cloudinary';
import { publicUrl } from './publicUrl';

export async function productImageUrl(req: Request, file: Express.Multer.File): Promise<string> {
  if (isCloudinaryConfigured) {
    return uploadImage(file.buffer);
  }

  if (!file.filename) {
    throw new Error('O arquivo da imagem não foi salvo em disco.');
  }

  return publicUrl(req, `/uploads/${file.filename}`);
}
