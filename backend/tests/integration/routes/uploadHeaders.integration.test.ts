import request from 'supertest';
import { app } from '../../../src/app';

describe('GET /uploads/:file', () => {
  it('deve adicionar nosniff aos arquivos públicos estáticos', async () => {
    const response = await request(app).get('/uploads/missing-file.png');

    expect(response.status).toBe(404);
    expect(response.headers['x-content-type-options']).toBe('nosniff');
  });
});
