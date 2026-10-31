import request from 'supertest';
import { app } from '../../../src/app';

describe('CORS do app Express', () => {
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  it('deve aceitar origem local e rejeitar origem desconhecida', async () => {
    const allowed = await request(app)
      .get('/not-a-real-route')
      .set('Origin', 'http://localhost:3000');
    expect(allowed.headers['access-control-allow-origin']).toBe('http://localhost:3000');

    const denied = await request(app)
      .get('/not-a-real-route')
      .set('Origin', 'https://evil.example');
    expect(denied.status).toBe(400);
    expect(denied.body.error).toContain('Origem não permitida');
    expect(errorSpy).not.toHaveBeenCalled();
  });
});
