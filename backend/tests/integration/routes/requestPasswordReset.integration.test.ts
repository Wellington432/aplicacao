import request from 'supertest';
import { app } from '../../../src/app';

describe('POST /senha/recuperar', () => {
  it('deve responder sem revelar se endereço não cadastrado existe', async () => {
    const response = await request(app)
      .post('/senha/recuperar')
      .send({ email: 'account@example.test' });

    expect(response.status).toBe(200);
    expect(response.body.message).toContain('Se o e-mail estiver cadastrado');
  });
});
