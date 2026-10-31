jest.mock('pix-utils', () => ({
  createStaticPix: jest.fn(() => ({ toBRCode: () => 'br-code' })),
  hasError: jest.fn(() => false),
}));

import { createStaticPix, hasError } from 'pix-utils';
import { gerarPayloadPix } from '../../../../src/modulos/pix/PixServices';

describe('gerarPayloadPix', () => {
  const original = {
    key: process.env.PIX_KEY,
    name: process.env.PIX_NOME_RECEBEDOR,
    city: process.env.PIX_CIDADE,
  };

  beforeEach(() => {
    process.env.PIX_KEY = 'test-key';
    process.env.PIX_NOME_RECEBEDOR = 'Feira Teste';
    process.env.PIX_CIDADE = 'Jales';
    (createStaticPix as jest.Mock).mockClear();
    jest.mocked(hasError).mockReturnValue(false);
  });

  afterAll(() => {
    if (original.key === undefined) delete process.env.PIX_KEY;
    else process.env.PIX_KEY = original.key;
    if (original.name === undefined) delete process.env.PIX_NOME_RECEBEDOR;
    else process.env.PIX_NOME_RECEBEDOR = original.name;
    if (original.city === undefined) delete process.env.PIX_CIDADE;
    else process.env.PIX_CIDADE = original.city;
  });

  it('deve gerar BR Code para valor e identificador válidos', () => {
    expect(
      gerarPayloadPix({
        chavePix: 'key',
        nomeRecebedor: 'ignored',
        cidade: 'ignored',
        valor: 1,
        txid: 'abc123',
      }),
    ).toBe('br-code');
    expect(createStaticPix).toHaveBeenCalledWith(
      expect.objectContaining({ transactionAmount: 1, txid: 'abc123' }),
    );
  });

  it.each([
    [0, 'abc123', 'valor do Pix'],
    [1, '', 'identificador Pix'],
    [1, 'invalid-id-contains-dash', 'identificador Pix'],
  ])('deve rejeitar parâmetros inválidos', (valor, txid, error) => {
    expect(() =>
      gerarPayloadPix({ chavePix: 'key', nomeRecebedor: 'Loja', cidade: 'Jales', valor, txid }),
    ).toThrow(error);
  });

  it('deve propagar erro reportado pela biblioteca Pix', () => {
    jest.mocked(hasError).mockReturnValue(true);
    expect(() =>
      gerarPayloadPix({ chavePix: 'key', nomeRecebedor: 'Loja', cidade: 'Jales', valor: 1, txid: 'abc' }),
    ).toThrow('Erro ao gerar payload Pix');
  });
});
