jest.mock('../../../../src/services/product/DeletProductServices', () => ({
  DeleteProductServices: jest.fn().mockImplementation(() => ({ execute: jest.fn().mockResolvedValue(undefined) })),
}));

import { DeleteProductController } from '../../../../src/controllers/product/DeleteProductController';
import { createRequest, createResponse } from '../../../helpers/httpMocks';

describe('DeleteProductController.handle', () => {
  it('deve desativar produto e retornar mensagem de sucesso', async () => {
    const res = createResponse();
    await new DeleteProductController().handle(createRequest({ body: { id: 'prod-1' } }), res);
    expect(res.json).toHaveBeenCalledWith({ message: 'Produto desativado com sucesso' });
  });
});
