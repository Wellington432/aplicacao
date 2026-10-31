import request from 'supertest';
import { app } from '../../../src/app';
import { createUser } from '../../helpers/integrationFixtures';

describe('POST /sessao', () => {
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  it('deve autenticar usuário e retornar token', async () => {
    const user = await createUser();
    const response = await request(app).post('/sessao').send({
      email: user.email,
      senha: user.password,
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body.id).toBe(user.id);
  });

  it('deve recusar credenciais incorretas', async () => {
    const user = await createUser();
    const response = await request(app)
      .post('/sessao')
      .send({ email: user.email, senha: 'wrong-password' });
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Usuário ou senha incorretos!');
    expect(errorSpy).not.toHaveBeenCalled();
  });
});
