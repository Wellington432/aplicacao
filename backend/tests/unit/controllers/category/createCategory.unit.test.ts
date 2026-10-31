jest.mock('../../../../src/services/category/CreateCategoryService', () => ({
  CreateCategoryService: jest.fn().mockImplementation(() => ({ execute: jest.fn().mockResolvedValue({ id: 'cat-1' }) })),
}));

import { CreateCategoryController } from '../../../../src/controllers/category/CreateCategoryController';
import { CreateCategoryService } from '../../../../src/services/category/CreateCategoryService';
import { createRequest, createResponse } from '../../../helpers/httpMocks';

describe('CreateCategoryController.handle', () => {
  it('deve encaminhar nome ao serviço e retornar a categoria criada', async () => {
    const res = createResponse();
    await new CreateCategoryController().handle(
      createRequest({ body: { nome: 'Frutas' } }),
      res,
    );
    expect((CreateCategoryService as jest.Mock).mock.results[0].value.execute).toHaveBeenCalledWith({
      nome: 'Frutas',
    });
    expect(res.json).toHaveBeenCalledWith({ id: 'cat-1' });
  });
});
