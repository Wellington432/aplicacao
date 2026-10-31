jest.mock('jsonwebtoken', () => ({ verify: jest.fn() }));

import { verify } from 'jsonwebtoken';
import { isAuthenticated } from '../../../src/middlewares/isAuthenticated';
import { createRequest, createResponse } from '../../helpers/httpMocks';

describe('isAuthenticated', () => {
  const previousSecret = process.env.JWT_SECRET;

  afterAll(() => {
    if (previousSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = previousSecret;
  });

  it('deve retornar 401 quando token não foi enviado ou malformado', () => {
    const noToken = createResponse();
    isAuthenticated(createRequest(), noToken, jest.fn());
    expect(noToken.status).toHaveBeenCalledWith(401);

    const malformed = createResponse();
    isAuthenticated(
      createRequest({ headers: { authorization: 'Basic abc' } }),
      malformed,
      jest.fn(),
    );
    expect(malformed.status).toHaveBeenCalledWith(401);
  });

  it('deve retornar 500 quando segredo não está configurado', () => {
    delete process.env.JWT_SECRET;
    const res = createResponse();
    isAuthenticated(createRequest({ headers: { authorization: 'Bearer token' } }), res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('deve anexar usuário ao request quando token é válido', () => {
    process.env.JWT_SECRET = 'local-unit-test-secret';
    (verify as jest.Mock).mockReturnValue({ sub: 'user-1' });
    const req = createRequest({ headers: { authorization: 'Bearer token' } });
    const next = jest.fn();

    isAuthenticated(req, createResponse(), next);

    expect(req.user_id).toBe('user-1');
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('deve retornar 401 para token inválido', () => {
    process.env.JWT_SECRET = 'local-unit-test-secret';
    (verify as jest.Mock).mockImplementation(() => {
      throw new Error('invalid');
    });
    const res = createResponse();

    isAuthenticated(createRequest({ headers: { authorization: 'Bearer bad' } }), res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(401);
  });
});
