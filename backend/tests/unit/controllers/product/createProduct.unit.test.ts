jest.mock('../../../../src/services/product/CreateProdutoServices', () => ({
  CreateProductServices: jest.fn().mockImplementation(() => ({ execute: jest.fn().mockResolvedValue({ id: 'prod-1' }) })),
}));

import { CreateProductController } from '../../../../src/controllers/product/CreateProductController';
import { CreateProductServices } from '../../../../src/services/product/CreateProdutoServices';
import { createRequest, createResponse } from '../../../helpers/httpMocks';

describe('CreateProductController.handle', () => {
  it('deve responder 400 sem arquivo de imagem', async () => {
    const res = createResponse();
    await new CreateProductController().handle(createRequest(), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Imagem é obrigatória.' });
    expect(CreateProductServices).not.toHaveBeenCalled();
  });

  it('deve converter campos numéricos e compor URL da imagem', async () => {
    const req = createRequest({
      body: { nome: 'Maçã', preco: '2.50', unidade: 'kg', descricao: 'Fresca', id_categoria: 'cat-1', estoque: '4' },
      file: { filename: 'photo.png' },
    });
    const res = createResponse();
    await new CreateProductController().handle(req, res);

    expect((CreateProductServices as jest.Mock).mock.results[0].value.execute).toHaveBeenCalledWith({
      nome: 'Maçã',
      preco: 2.5,
      unidade: 'kg',
      descricao: 'Fresca',
      banner: 'http://localhost/uploads/photo.png',
      id_categoria: 'cat-1',
      estoque: 4,
    });
    expect(res.json).toHaveBeenCalledWith({ id: 'prod-1' });
  });
});
