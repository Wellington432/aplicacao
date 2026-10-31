jest.mock('bcryptjs', () => ({ hash: jest.fn(), compare: jest.fn() }));
jest.mock('../../../../src/utils/token', () => ({
  normalizarEmail: (email: unknown) =>
    typeof email === 'string' ? email.trim().toLowerCase() : '',
}));

import prisma from '../../../../src/prisma';
import { hash } from 'bcryptjs';
import { CreateUserService } from '../../../../src/services/user/CreateUserServices';

describe('CreateUserService.execute', () => {
  beforeEach(() => {
    (hash as jest.Mock).mockReset();
  });

  it('deve normalizar e criar usuário com senha criptografada', async () => {
    (prisma.usuario.findFirst as jest.Mock).mockResolvedValue(null);
    (hash as jest.Mock).mockResolvedValue('senha-hash');
    (prisma.usuario.create as jest.Mock).mockResolvedValue({
      id: 'user-1',
      nome: 'Ana',
      email: 'ana@example.test',
    });

    await expect(
      new CreateUserService().execute({
        nome: ' Ana ',
        email: ' ANA@example.test ',
        senha: 'senha1234',
      }),
    ).resolves.toEqual({ id: 'user-1', nome: 'Ana', email: 'ana@example.test' });
    expect(hash).toHaveBeenCalledWith('senha1234', 10);
    expect(prisma.usuario.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          nome: 'Ana',
          email: 'ana@example.test',
          senha: 'senha-hash',
        },
      }),
    );
  });

  it.each([
    [{ nome: ' ', email: 'a@example.test', senha: 'senha1234' }, 'Dados ausentes!'],
    [{ nome: 'Ana', email: 'invalido', senha: 'senha1234' }, 'E-mail inválido!'],
    [{ nome: 'Ana', email: 'ana@example.test', senha: 'curta' }, 'ao menos 8 caracteres'],
  ])('deve rejeitar dados inválidos antes de acessar o banco', async (payload, error) => {
    await expect(new CreateUserService().execute(payload)).rejects.toThrow(error);
    expect(prisma.usuario.findFirst).not.toHaveBeenCalled();
  });

  it('deve rejeitar e-mail já cadastrado', async () => {
    (prisma.usuario.findFirst as jest.Mock).mockResolvedValue({ id: 'existing' });
    await expect(
      new CreateUserService().execute({
        nome: 'Ana',
        email: 'ana@example.test',
        senha: 'senha1234',
      }),
    ).rejects.toThrow('Email já Cadastrado!');
    expect(hash).not.toHaveBeenCalled();
  });
});
