jest.mock('../../../../src/services/product/UpdateProdutoServices', () => ({
  UpdateProductServices: jest.fn().mockImplementation(() => ({ execute: jest.fn().mockResolvedValue({ id: 'prod-1' }) })),
}));

import { UpdateProductController } from '../../../../src/controllers/product/UpdateProductController';
import { UpdateProductServices } from '../../../../src/services/product/UpdateProdutoServices';
import { createRequest, createResponse } from '../../../helpers/httpMocks';

describe('UpdateProductController.handle', () => {
  it('deve converter campos, manter banner opcional e normalizar ativo', async () => {
    const req = createRequest({
      body: { id: 'prod-1', nome: 'Maçã', preco: '2', unidade: 'kg', descricao: 'Fresca', id_categoria: 'cat-1', estoque: '3', ativo: 'true' },
    });
    const res = createResponse();
    await new UpdateProductController().handle(req, res);

    expect((UpdateProductServices as jest.Mock).mock.results[0].value.execute).toHaveBeenCalledWith({
      id: 'prod-1',
      nome: 'Maçã',
      preco: 2,
      unidade: 'kg',
      descricao: 'Fresca',
      id_categoria: 'cat-1',
      estoque: 3,
      banner: undefined,
      ativo: true,
    });
  });
});
