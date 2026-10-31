jest.mock('google-auth-library', () => ({
  OAuth2Client: jest.fn().mockImplementation(() => ({
    verifyIdToken: jest.fn().mockResolvedValue({
      getPayload: () => ({
        sub: 'google-1',
        email: 'ana@example.test',
        name: 'Ana',
        email_verified: true,
      }),
    }),
    getToken: jest.fn().mockResolvedValue({ tokens: { id_token: 'id-token' } }),
  })),
}));
jest.mock('../../../../src/utils/token', () => ({
  gerarToken: jest.fn(() => 'jwt-test'),
  normalizarEmail: (email: unknown) =>
    typeof email === 'string' ? email.trim().toLowerCase() : '',
}));

import prisma from '../../../../src/prisma';
import { OAuth2Client } from 'google-auth-library';
import { AuthGoogleUserService } from '../../../../src/services/user/AuthGoogleUserService';

describe('AuthGoogleUserService.execute', () => {
  const oldClientId = process.env.GOOGLE_CLIENT_ID;
  const oldClientSecret = process.env.GOOGLE_CLIENT_SECRET;

  beforeEach(() => {
    process.env.GOOGLE_CLIENT_ID = 'test-client-id';
    process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';
  });

  afterAll(() => {
    if (oldClientId === undefined) delete process.env.GOOGLE_CLIENT_ID;
    else process.env.GOOGLE_CLIENT_ID = oldClientId;
    if (oldClientSecret === undefined) delete process.env.GOOGLE_CLIENT_SECRET;
    else process.env.GOOGLE_CLIENT_SECRET = oldClientSecret;
  });

  it('deve retornar usuário Google já associado', async () => {
    (prisma.usuario.findUnique as jest.Mock).mockResolvedValue({
      id: 'user-1',
      nome: 'Ana',
      email: 'ana@example.test',
      tipo: 'CLIENTE',
    });

    await expect(
      new AuthGoogleUserService().execute({ credential: 'credential' }),
    ).resolves.toMatchObject({ id: 'user-1', token: 'jwt-test' });
    expect(prisma.usuario.findUnique).toHaveBeenCalledWith({ where: { googleId: 'google-1' } });
    expect(prisma.usuario.create).not.toHaveBeenCalled();
  });

  it('deve rejeitar credencial ausente e configuração ausente', async () => {
    await expect(new AuthGoogleUserService().execute({})).rejects.toThrow(
      'Credencial do Google ausente.',
    );
    delete process.env.GOOGLE_CLIENT_ID;
    await expect(
      new AuthGoogleUserService().execute({ credential: 'credential' }),
    ).rejects.toThrow('Login com Google não configurado');
  });

  it('deve associar credencial Google a conta existente pelo e-mail', async () => {
    const user = {
      id: 'user-1',
      nome: 'Ana',
      email: 'ana@example.test',
      tipo: 'CLIENTE',
    };
    (prisma.usuario.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.usuario.findFirst as jest.Mock).mockResolvedValue(user);
    (prisma.usuario.update as jest.Mock).mockResolvedValue(user);

    await expect(
      new AuthGoogleUserService().execute({ credential: 'credential' }),
    ).resolves.toMatchObject({ id: 'user-1', token: 'jwt-test' });
    expect(prisma.usuario.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { googleId: 'google-1' },
    });
  });

  it('deve criar conta nova após validar código OAuth', async () => {
    jest.mocked(OAuth2Client).mockImplementationOnce(() => ({
      getToken: jest.fn().mockResolvedValue({ tokens: { id_token: 'id-token' } }),
      verifyIdToken: jest.fn().mockResolvedValue({
        getPayload: () => ({
          sub: 'google-1',
          email: 'ana@example.test',
          name: 'Ana',
          email_verified: true,
        }),
      }),
    }) as unknown as OAuth2Client);
    (prisma.usuario.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.usuario.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.usuario.create as jest.Mock).mockResolvedValue({
      id: 'new-user',
      nome: 'Ana',
      email: 'ana@example.test',
      tipo: 'CLIENTE',
    });

    await expect(new AuthGoogleUserService().execute({ code: 'oauth-code' })).resolves.toMatchObject({
      id: 'new-user',
      token: 'jwt-test',
    });
    expect(prisma.usuario.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          nome: 'Ana',
          email: 'ana@example.test',
          googleId: 'google-1',
          senha: null,
        },
      }),
    );
  });

  it('deve recusar e-mail não verificado e registrar falha de validação externa', async () => {
    jest.mocked(OAuth2Client).mockImplementationOnce(() => ({
      verifyIdToken: jest.fn().mockResolvedValue({
        getPayload: () => ({
          sub: 'google-1',
          email: 'ana@example.test',
          email_verified: false,
        }),
      }),
    }) as unknown as OAuth2Client);
    await expect(
      new AuthGoogleUserService().execute({ credential: 'credential' }),
    ).rejects.toThrow('E-mail do Google não verificado.');

    jest.mocked(OAuth2Client).mockImplementationOnce(() => ({
      verifyIdToken: jest.fn().mockRejectedValue(new Error('invalid signature')),
    }) as unknown as OAuth2Client);
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    await expect(
      new AuthGoogleUserService().execute({ credential: 'invalid' }),
    ).rejects.toThrow('Não foi possível validar o login com Google.');
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
