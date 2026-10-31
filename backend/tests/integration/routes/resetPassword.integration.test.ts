import request from 'supertest';
import { app } from '../../../src/app';

describe('POST /senha/redefinir', () => {
  it('deve responder 400 para token inválido', async () => {
    const response = await request(app)
      .post('/senha/redefinir')
      .send({ token: 'invalid', senha: 'test-password-123' });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('link é inválido ou expirou');
  });
});
