import request from 'supertest';
import { app } from '../../../src/app';

describe('POST /sessao/google', () => {
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  it('deve rejeitar ausência de credencial sem chamar serviço externo', async () => {
    const response = await request(app).post('/sessao/google').send({});
    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Credencial do Google ausente');
    expect(errorSpy).not.toHaveBeenCalled();
  });
});
