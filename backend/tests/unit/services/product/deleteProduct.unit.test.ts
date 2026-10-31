import { DeleteProductServices } from '../../../../src/services/product/DeletProductServices';
import prisma from '../../../../src/prisma';

describe('DeleteProductServices.execute', () => {
  it('deve desativar o produto sem removê-lo do banco', async () => {
    (prisma.produto.update as jest.Mock).mockResolvedValue({ id: 'product-1', ativo: false });

    await expect(new DeleteProductServices().execute({ id: 'product-1' })).resolves.toEqual({
      id: 'product-1',
      ativo: false,
    });
    expect(prisma.produto.update).toHaveBeenCalledWith({
      where: { id: 'product-1' },
      data: { ativo: false },
    });
  });

  it('deve rejeitar identificador ausente', async () => {
    await expect(new DeleteProductServices().execute({ id: '' })).rejects.toThrow(
      'Dados ausentes',
    );
  });
});
