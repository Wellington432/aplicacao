import '../config/env';
import { v2 as cloudinary } from 'cloudinary';

const credentials = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
};

const configuredValues = Object.values(credentials).filter(Boolean).length;

if (configuredValues > 0 && configuredValues < Object.keys(credentials).length) {
  throw new Error('Configure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY e CLOUDINARY_API_SECRET.');
}

export const isCloudinaryConfigured = configuredValues === Object.keys(credentials).length;

if (isCloudinaryConfigured) {
  cloudinary.config(credentials);
}

export function uploadImage(buffer: Buffer): Promise<string> {
  if (!isCloudinaryConfigured) {
    return Promise.reject(new Error('Cloudinary não está configurado.'));
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'feiraetec/products', resource_type: 'image' },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        if (!result?.secure_url) {
          reject(new Error('O Cloudinary não retornou uma URL segura para a imagem.'));
          return;
        }

        const secureUrl = new URL(result.secure_url);
        secureUrl.protocol = 'https:';
        resolve(secureUrl.toString());
      },
    );

    uploadStream.end(buffer);
  });
}
