import request from 'supertest';
import { app } from '../../../src/app';

describe('GET /endereco/:cep', () => {
  it('deve validar CEP antes de consultar serviço externo', async () => {
    const response = await request(app).get('/endereco/123');
    expect(response.status).toBe(400);
    expect(response.body.error).toContain('CEP inválido');
  });
});
