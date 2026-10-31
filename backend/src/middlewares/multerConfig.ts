import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

/**
 * Comprovantes de pagamento são dados pessoais/financeiros, então ficam FORA
 * da pasta pública /uploads. Eles só podem ser baixados pela rota autenticada
 * GET /checkout/:id_compra/comprovante (dono do pedido ou admin).
 */
export const COMPROVANTES_DIR = path.resolve(__dirname, '..', '..', 'private_uploads', 'comprovantes');

/** Pasta antiga (pública) — usada só para ler comprovantes enviados antes da correção. */
export const COMPROVANTES_DIR_LEGADO = path.resolve(__dirname, '..', '..', 'uploads', 'comprovantes');

if (!fs.existsSync(COMPROVANTES_DIR)) fs.mkdirSync(COMPROVANTES_DIR, { recursive: true });

// A extensão vem do mimetype validado, nunca do nome original do arquivo
// (antes dava para enviar "image/png" com nome "x.html" e gerar XSS).
const PERMITIDOS: Record<string, string> = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/webp': '.webp',
  'application/pdf': '.pdf',
};

export const uploadComprovante = multer({
  storage: multer.diskStorage({
    destination: COMPROVANTES_DIR,
    filename: (req, file, cb) => {
      const ext = PERMITIDOS[file.mimetype] ?? '';
      cb(null, `${crypto.randomUUID()}${ext}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (!PERMITIDOS[file.mimetype]) {
      return cb(new Error('Formato inválido. Envie PNG, JPG, WEBP ou PDF.'));
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});
