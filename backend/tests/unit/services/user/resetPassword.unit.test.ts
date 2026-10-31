jest.mock('bcryptjs', () => ({ hash: jest.fn().mockResolvedValue('password-hash') }));

import prisma from '../../../../src/prisma';
import { hash } from 'bcryptjs';
import { PasswordResetService } from '../../../../src/services/user/PasswordResetService';

describe('PasswordResetService.redefinir', () => {
  it.each([
    ['bad-token', 'senha1234', 'Este link é inválido ou expirou'],
    ['a'.repeat(64), 'curta', 'ao menos 8 caracteres'],
    ['a'.repeat(64), 'á'.repeat(37), 'no máximo 72 bytes'],
  ])('deve rejeitar token ou senha inválidos', async (token, password, error) => {
    await expect(new PasswordResetService().redefinir(token, password)).rejects.toThrow(error);
    expect(prisma.recuperacaoSenha.findUnique).not.toHaveBeenCalled();
  });

  it('deve consumir token e atualizar senha em transação', async () => {
    (prisma.recuperacaoSenha.findUnique as jest.Mock).mockResolvedValue({ id_usuario: 'user-1' });
    const transaction = {
      recuperacaoSenha: {
        deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      usuario: { update: jest.fn().mockResolvedValue({}) },
    };
    (prisma.$transaction as jest.Mock).mockImplementation(
      (callback: (tx: typeof transaction) => Promise<void>) => callback(transaction),
    );
    const token = 'a'.repeat(64);

    await expect(new PasswordResetService().redefinir(token, 'novaSenha123')).resolves.toBeUndefined();
    expect(hash).toHaveBeenCalledWith('novaSenha123', 10);
    expect(transaction.usuario.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { senha: 'password-hash' },
    });
  });

  it('deve rejeitar token expirado dentro da transação', async () => {
    (prisma.recuperacaoSenha.findUnique as jest.Mock).mockResolvedValue({ id_usuario: 'user-1' });
    (prisma.$transaction as jest.Mock).mockImplementation(async (callback) =>
      callback({
        recuperacaoSenha: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
        usuario: { update: jest.fn() },
      }),
    );

    await expect(
      new PasswordResetService().redefinir('a'.repeat(64), 'novaSenha123'),
    ).rejects.toThrow('Este link é inválido ou expirou');
  });
});
