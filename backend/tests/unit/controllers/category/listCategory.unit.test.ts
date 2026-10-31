jest.mock('../../../../src/services/category/ListCategoryService', () => ({
  ListCategoryService: jest.fn().mockImplementation(() => ({ execute: jest.fn().mockResolvedValue([]) })),
}));

import { ListCategoryController } from '../../../../src/controllers/category/ListCategoryController';
import { createRequest, createResponse } from '../../../helpers/httpMocks';

describe('ListCategoryController.handle', () => {
  it('deve retornar lista de categorias', async () => {
    const res = createResponse();
    await new ListCategoryController().handle(createRequest(), res);
    expect(res.json).toHaveBeenCalledWith([]);
  });
});
