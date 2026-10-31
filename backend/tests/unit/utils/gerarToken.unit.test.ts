import jwt from 'jsonwebtoken';
import { gerarToken } from '../../../src/utils/token';

describe('gerarToken', () => {
  const previousSecret = process.env.JWT_SECRET;
  const previousExpiry = process.env.JWT_EXPIRES_IN;

  afterAll(() => {
    if (previousSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = previousSecret;
    if (previousExpiry === undefined) delete process.env.JWT_EXPIRES_IN;
    else process.env.JWT_EXPIRES_IN = previousExpiry;
  });

  it('deve assinar token com subject e duração configurados', () => {
    process.env.JWT_SECRET = 'unit-test-secret';
    process.env.JWT_EXPIRES_IN = '2h';

    const token = gerarToken({ id: 'user-1', nome: 'Ana', email: 'ana@example.test' });
    expect(jwt.verify(token, 'unit-test-secret')).toMatchObject({
      sub: 'user-1',
      nome: 'Ana',
      usuario: 'ana@example.test',
    });
  });

  it('deve rejeitar segredo ausente', () => {
    delete process.env.JWT_SECRET;
    expect(() =>
      gerarToken({ id: 'user-1', nome: 'Ana', email: 'ana@example.test' }),
    ).toThrow('Configuração de segurança ausente no servidor.');
  });
});
