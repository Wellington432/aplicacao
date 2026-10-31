import { getFreteEntrega } from '../../../../src/services/order/CheckoutService';

describe('getFreteEntrega', () => {
  const original = process.env.FRETE_ENTREGA;

  afterAll(() => {
    if (original === undefined) delete process.env.FRETE_ENTREGA;
    else process.env.FRETE_ENTREGA = original;
  });

  it('deve arredondar frete a duas casas decimais', () => {
    process.env.FRETE_ENTREGA = '5.237';
    expect(getFreteEntrega()).toBe(5.24);
  });

  it.each(['-1', 'NaN', 'Infinity'])('deve rejeitar valor inválido %s', (value) => {
    process.env.FRETE_ENTREGA = value;
    expect(() => getFreteEntrega()).toThrow('FRETE_ENTREGA deve ser um valor válido');
  });

  it('deve usar zero quando configuração estiver ausente', () => {
    delete process.env.FRETE_ENTREGA;
    expect(getFreteEntrega()).toBe(0);
  });
});
