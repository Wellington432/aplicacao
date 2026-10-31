import { Product } from '../../../src/middlewares/verificaçãodeInformaçãoProduct';
import { createRequest, createResponse } from '../../helpers/httpMocks';

describe('Product', () => {
  it('deve validar body correto e chamar next', () => {
    const req = createRequest({
      body: {
        nome: 'Produto',
        preco: 1.25,
        category: 1,
        data: '2026-10-21T00:00:00.000Z',
        banner: 'https://example.test/image.png',
      },
    });
    const next = jest.fn();

    Product(req, createResponse(), next);

    expect(req.body.nome).toBe('Produto');
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('deve lançar erro de validação e não chamar next para dados inválidos', () => {
    const next = jest.fn();
    expect(() => Product(createRequest({ body: { preco: -1 } }), createResponse(), next)).toThrow();
    expect(next).not.toHaveBeenCalled();
  });
});
