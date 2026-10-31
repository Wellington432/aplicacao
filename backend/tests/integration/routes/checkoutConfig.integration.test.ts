import request from 'supertest';
import { app } from '../../../src/app';

describe('GET /config/checkout', () => {
  it('deve responder o valor configurado de frete', async () => {
    const response = await request(app).get('/config/checkout');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('freteEntrega');
  });
});
