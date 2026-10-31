import request from 'supertest';
import { app } from '../../../src/app';
import prisma from '../../../src/prisma';

describe('POST /novousuario', () => {
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  it('deve persistir novo usuário e retornar seus dados públicos', async () => {
    const payload = {
      nome: 'Conta de teste',
      email: `new-${Date.now()}@example.test`,
      senha: 'test-password-123',
    };
    const response = await request(app).post('/novousuario').send(payload);

    expect(response.status).toBe(200);
    expect(response.body.email).toBe(payload.email);
    expect(response.body).not.toHaveProperty('senha');
    await expect(prisma.usuario.findUnique({ where: { email: payload.email } })).resolves.toMatchObject({
      nome: payload.nome,
    });
  });

  it('deve rejeitar payload inválido', async () => {
    const response = await request(app).post('/novousuario').send({
      nome: 'Usuário de teste inválido',
      email: 'invalid@example.test',
    });
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Dados ausentes!');
    expect(errorSpy).not.toHaveBeenCalled();
  });
});
