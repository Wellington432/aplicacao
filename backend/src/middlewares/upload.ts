import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import { ClientError } from '../errors/ClientError';

const ALLOWED_MIMETYPES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

const storage = multer.diskStorage({
  destination: path.resolve(__dirname, '..', '..', 'uploads'),
  filename: (req, file, cb) => {
   
    const ext = ALLOWED_MIMETYPES[file.mimetype] ?? '';
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

const categoryIconDirectory = path.resolve(__dirname, '..', '..', 'uploads', 'category-icons');
fs.mkdirSync(categoryIconDirectory, { recursive: true });

const CATEGORY_ICON_MIMETYPES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/svg+xml': '.svg',
};

const categoryIconStorage = multer.diskStorage({
  destination: categoryIconDirectory,
  filename: (_req, file, cb) => {
    cb(null, `${crypto.randomUUID()}${CATEGORY_ICON_MIMETYPES[file.mimetype] ?? ''}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIMETYPES[file.mimetype]) {
      cb(null, true);
    } else {
      cb(new ClientError('Tipo de arquivo não suportado. Use JPEG, PNG, WEBP ou GIF.'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

const uploadCategoryIcon = multer({
  storage: categoryIconStorage,
  fileFilter: (_req, file, cb) => {
    if (CATEGORY_ICON_MIMETYPES[file.mimetype]) {
      cb(null, true);
    } else {
      cb(new ClientError('Tipo de arquivo não suportado. Envie PNG, JPG, WEBP ou SVG.'));
    }
  },
  limits: { fileSize: 1024 * 1024 },
});

export { upload, uploadCategoryIcon };
