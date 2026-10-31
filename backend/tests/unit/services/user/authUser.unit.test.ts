jest.mock('bcryptjs', () => ({ hash: jest.fn(), compare: jest.fn() }));
jest.mock('../../../../src/utils/token', () => ({
  gerarToken: jest.fn(() => 'jwt-test'),
  normalizarEmail: (email: unknown) =>
    typeof email === 'string' ? email.trim().toLowerCase() : '',
}));

import prisma from '../../../../src/prisma';
import { compare } from 'bcryptjs';
import { AuthUserService } from '../../../../src/services/user/AuthUserService';

describe('AuthUserService.execute', () => {
  beforeEach(() => {
    (compare as jest.Mock).mockReset();
  });

  it('deve autenticar credenciais válidas e devolver token', async () => {
    (prisma.usuario.findFirst as jest.Mock).mockResolvedValue({
      id: 'user-1',
      nome: 'Ana',
      email: 'ana@example.test',
      tipo: 'CLIENTE',
      senha: 'hash',
    });
    (compare as jest.Mock).mockResolvedValue(true);

    await expect(
      new AuthUserService().execute({ email: ' ANA@example.test ', senha: 'senha' }),
    ).resolves.toEqual({
      id: 'user-1',
      nome: 'Ana',
      email: 'ana@example.test',
      tipo: 'CLIENTE',
      token: 'jwt-test',
    });
    expect(prisma.usuario.findFirst).toHaveBeenCalledWith({
      where: { email: { equals: 'ana@example.test', mode: 'insensitive' } },
    });
  });

  it('deve rejeitar e-mail ou senha ausentes sem consultar o banco', async () => {
    await expect(new AuthUserService().execute({ email: '', senha: 'senha' })).rejects.toThrow(
      'Informe e-mail e senha.',
    );
    expect(prisma.usuario.findFirst).not.toHaveBeenCalled();
  });

  it('deve rejeitar usuário inexistente', async () => {
    (prisma.usuario.findFirst as jest.Mock).mockResolvedValue(null);
    await expect(
      new AuthUserService().execute({ email: 'ana@example.test', senha: 'senha' }),
    ).rejects.toThrow('Usuário ou senha incorretos!');
  });

  it('deve informar quando a conta exige login Google', async () => {
    (prisma.usuario.findFirst as jest.Mock).mockResolvedValue({ id: 'u', senha: null });
    await expect(
      new AuthUserService().execute({ email: 'ana@example.test', senha: 'senha' }),
    ).rejects.toThrow('Esta conta usa login com Google. Entre com o Google.');
  });

  it('deve rejeitar senha incorreta', async () => {
    (prisma.usuario.findFirst as jest.Mock).mockResolvedValue({ id: 'u', senha: 'hash' });
    (compare as jest.Mock).mockResolvedValue(false);
    await expect(
      new AuthUserService().execute({ email: 'ana@example.test', senha: 'errada' }),
    ).rejects.toThrow('Usuário ou senha incorretos!');
  });
});
