import { cleanTestDatabase } from '../helpers/integrationFixtures';

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({ sendMail: jest.fn().mockResolvedValue(undefined) })),
}));

beforeAll(() => {
  process.env.JWT_SECRET = 'local-test-secret-change-me';
  process.env.JWT_EXPIRES_IN = '1h';
  process.env.SMTP_HOST = 'smtp.example.test';
  process.env.SMTP_FROM = 'no-reply@example.test';
  process.env.SMTP_PORT = '587';
  process.env.SMTP_USER = '';
  process.env.SMTP_PASS = '';
  process.env.FRONTEND_URL = 'http://localhost:3000';
  process.env.PIX_KEY = 'local-test-pix-key';
  process.env.PIX_NOME_RECEBEDOR = 'Feira Etec Teste';
  process.env.PIX_CIDADE = 'Jales';
  process.env.FRETE_ENTREGA = '5';
});

beforeAll(cleanTestDatabase);
afterEach(cleanTestDatabase);

afterAll(async () => {
  const prismaClient = require('../../src/prisma').default;
  await prismaClient.$disconnect();
});
