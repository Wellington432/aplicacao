import { normalizarEmail } from '../../../src/utils/token';

describe('normalizarEmail', () => {
  it('deve remover espaços e converter e-mail para minúsculas', () => {
    expect(normalizarEmail(' ANA@EXAMPLE.TEST ')).toBe('ana@example.test');
  });

  it('deve retornar string vazia para valores que não sejam texto', () => {
    expect(normalizarEmail(null)).toBe('');
    expect(normalizarEmail(123)).toBe('');
  });
});
