import { obterDadosRecebedorPix } from '../../../../src/modulos/pix/PixServices';

describe('obterDadosRecebedorPix', () => {
  const original = {
    key: process.env.PIX_KEY,
    name: process.env.PIX_NOME_RECEBEDOR,
    city: process.env.PIX_CIDADE,
  };

  afterAll(() => {
    if (original.key === undefined) delete process.env.PIX_KEY;
    else process.env.PIX_KEY = original.key;
    if (original.name === undefined) delete process.env.PIX_NOME_RECEBEDOR;
    else process.env.PIX_NOME_RECEBEDOR = original.name;
    if (original.city === undefined) delete process.env.PIX_CIDADE;
    else process.env.PIX_CIDADE = original.city;
  });

  it('deve normalizar nome e cidade do recebedor', () => {
    process.env.PIX_KEY = ' test-key ';
    process.env.PIX_NOME_RECEBEDOR = 'Feira São José';
    process.env.PIX_CIDADE = 'São Paulo';

    expect(obterDadosRecebedorPix()).toEqual({
      chavePix: 'test-key',
      nomeRecebedor: 'FEIRA SAO JOSE',
      cidade: 'SAO PAULO',
    });
  });

  it('deve rejeitar configuração incompleta', () => {
    delete process.env.PIX_KEY;
    expect(() => obterDadosRecebedorPix()).toThrow('Configure PIX_KEY');
  });
});
