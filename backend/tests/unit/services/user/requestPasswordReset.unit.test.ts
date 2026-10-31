jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({ sendMail: jest.fn().mockResolvedValue(undefined) })),
}));

import prisma from '../../../../src/prisma';
import { createTransport } from 'nodemailer';
import { PasswordResetService } from '../../../../src/services/user/PasswordResetService';

describe('PasswordResetService.solicitar', () => {
  const env = { ...process.env };

  beforeEach(() => {
    process.env.SMTP_HOST = 'smtp.example.test';
    process.env.SMTP_FROM = 'test@example.test';
    process.env.SMTP_PORT = '587';
    process.env.FRONTEND_URL = 'http://localhost:3000';
  });

  afterAll(() => {
    process.env = env;
  });

  it('deve enviar link de redefinição para usuário existente', async () => {
    (prisma.usuario.findFirst as jest.Mock).mockResolvedValue({
      id: 'user-1',
      email: 'ana@example.test',
    });
    (prisma.$transaction as jest.Mock).mockResolvedValue([]);

    await expect(new PasswordResetService().solicitar(' ANA@example.test ')).resolves.toBeUndefined();
    expect(prisma.usuario.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { email: { equals: 'ana@example.test', mode: 'insensitive' } } }),
    );
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(createTransport).toHaveBeenCalledTimes(1);
  });

  it('deve não revelar se e-mail inválido ou inexistente está cadastrado', async () => {
    await expect(new PasswordResetService().solicitar('inválido')).resolves.toBeUndefined();
    expect(prisma.usuario.findFirst).not.toHaveBeenCalled();

    (prisma.usuario.findFirst as jest.Mock).mockResolvedValue(null);
    await expect(new PasswordResetService().solicitar('none@example.test')).resolves.toBeUndefined();
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});
