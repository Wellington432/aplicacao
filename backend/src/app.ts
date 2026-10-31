/// <reference path="./@types/express/index.d.ts" />
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import cors from 'cors';
import { MulterError } from 'multer';
import { Prisma } from '@prisma/client';
import { ClientError } from './errors/ClientError';
import { router } from './routes';

const app = express();

// Atrás do proxy do Render, faz req.protocol voltar "https" (e não "http")
app.set('trust proxy', 1);

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  const expectedMissingRecord =
    err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025';
  if (!(err instanceof ClientError) && !expectedMissingRecord) {
    console.error('[erro]', req.method, req.path, err);
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2025') {
      return res.status(404).json({
        error: 'Registro não encontrado.',
        ...(process.env.NODE_ENV !== 'production' ? { codigo: err.code, detalhe: err.meta } : {})
      });
    }
    if (err.code === 'P2002') {
      return res.status(409).json({
        error: 'Email já Cadastrado!',
        ...(process.env.NODE_ENV !== 'production' ? { codigo: err.code, detalhe: err.meta } : {})
      });
    }
    if (err.code === 'P2003') {
      return res.status(400).json({
        error: 'Referência inválida (categoria/produto inexistente).',
        ...(process.env.NODE_ENV !== 'production' ? { codigo: err.code, detalhe: err.meta } : {})
      });
    }
    return res.status(400).json({
      error: 'Erro na operação com o banco de dados.',
      ...(process.env.NODE_ENV !== 'production' ? { codigo: err.code, detalhe: err.meta } : {})
    });
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({ error: 'Dados inválidos.' });
  }

  if (err instanceof MulterError) {
    const msg = err.code === 'LIMIT_FILE_SIZE' ? 'Arquivo muito grande (máx. 5MB).' : 'Erro no envio do arquivo.';
    return res.status(400).json({ error: msg });
  }

  if (err instanceof Error) {
    return res.status(400).json({ error: err.message });
  }

  return res.status(500).json({ error: 'Erro interno do servidor.' });
}

const origensPermitidas = (process.env.FRONTEND_URL ?? '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (origensPermitidas.includes(origin) || /^http:\/\/localhost(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    return callback(new ClientError('Origem não permitida pelo CORS.'));
  },
}));

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ClientError) {
    return res.status(400).json({ error: err.message });
  }
  return next(err);
});

app.use(express.json({ limit: '1mb' }));

app.use('/uploads/comprovantes', (req, res) => res.status(404).end());
app.use('/uploads', (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
}, express.static(path.resolve(__dirname, '..', 'uploads'), { dotfiles: 'deny' }));

app.use(router);

app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada.' });
});

app.use(errorHandler);

export { app };