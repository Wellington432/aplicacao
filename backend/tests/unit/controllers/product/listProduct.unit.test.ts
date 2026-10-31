jest.mock('../../../../src/services/product/ListProdutoServices', () => ({
  ListProdutoServices: jest.fn().mockImplementation(() => ({ execute: jest.fn().mockResolvedValue([]) })),
}));

import { ListProductController } from '../../../../src/controllers/product/ListProductController';
import { ListProdutoServices } from '../../../../src/services/product/ListProdutoServices';
import { createRequest, createResponse } from '../../../helpers/httpMocks';

describe('ListProductController.handle', () => {
  it('deve converter query e interpretar opção todos', async () => {
    const query = { id_categoria: 'cat-1', nome: 'maçã', todos: 'true' };
    const res = createResponse();
    await new ListProductController().handle(createRequest({ query }), res);
    expect((ListProdutoServices as jest.Mock).mock.results[0].value.execute).toHaveBeenCalledWith({
      id_categoria: 'cat-1',
      nome: 'maçã',
      todos: true,
    });
    expect(res.json).toHaveBeenCalledWith([]);
  });
});
