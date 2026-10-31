import { normalizarTextoPix } from '../../../../src/modulos/pix/PixServices';

describe('normalizarTextoPix', () => {
  it('deve remover acentos, caracteres especiais e limitar comprimento', () => {
    expect(normalizarTextoPix('  São José @ Centro  ', 12)).toBe('SAO JOSE CEN');
  });

  it('deve retornar string vazia para texto composto somente de símbolos', () => {
    expect(normalizarTextoPix('###', 10)).toBe('');
  });
});
