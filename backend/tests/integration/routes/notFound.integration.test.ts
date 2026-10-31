import request from 'supertest';
import { app } from '../../../src/app';

describe('fallback de rotas', () => {
  it('deve responder 404 JSON para caminho inexistente', async () => {
    const response = await request(app).get('/not-a-real-route');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Rota não encontrada.' });
  });
});
