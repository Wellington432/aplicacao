import request from 'supertest';
import { app } from '../../../src/app';

describe('GET /uploads/comprovantes/:file', () => {
  it('deve manter comprovantes antigos indisponíveis publicamente', async () => {
    const response = await request(app).get('/uploads/comprovantes/receipt.pdf');
    expect(response.status).toBe(404);
  });
});
