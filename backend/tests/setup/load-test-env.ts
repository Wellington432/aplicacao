import path from 'node:path';
import dotenv from 'dotenv';

const envPath = path.resolve(__dirname, '../../.env.test');
const result = dotenv.config({ path: envPath, override: true, quiet: true });
if (result.error) {
  throw new Error('Configure backend/.env.test antes de executar testes de integração.');
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL não foi definido em backend/.env.test.');
}

let databaseName: string;
try {
  databaseName = new URL(databaseUrl).pathname.replace(/^\/+/, '');
} catch {
  throw new Error('DATABASE_URL em backend/.env.test não é uma URL válida.');
}

if (!/test/i.test(databaseName)) {
  throw new Error('Por segurança, DATABASE_URL deve apontar para um banco cujo nome contenha "test".');
}

process.env.NODE_ENV = 'test';
process.env.FRONTEND_URL = 'http://localhost:3000';
