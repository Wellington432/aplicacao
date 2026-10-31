import { CreateProductServices } from '../../../../src/services/product/CreateProdutoServices';
import prisma from '../../../../src/prisma';

const product = {
  nome: 'Maçã',
  preco: 2.5,
  unidade: 'kg',
  descricao: 'Maçã fresca',
  banner: 'banner.jpg',
  id_categoria: 'category-1',
};

describe('CreateProductServices.execute', () => {
  it('deve criar produto com estoque padrão zero', async () => {
    (prisma.produto.create as jest.Mock).mockResolvedValue({ id: 'product-1' });

    await expect(new CreateProductServices().execute(product)).resolves.toEqual({
      id: 'product-1',
    });
    expect(prisma.produto.create).toHaveBeenCalledWith({
      data: { ...product, estoque: 0 },
    });
  });

  it.each([
    [{ ...product, nome: '' }, 'Dados ausentes'],
    [{ ...product, preco: 0 }, 'Preço inválido'],
    [{ ...product, preco: Number.NaN }, 'Preço inválido'],
    [{ ...product, estoque: -1 }, 'Estoque não pode ser negativo'],
  ])('deve validar dados inválidos', async (payload, error) => {
    await expect(new CreateProductServices().execute(payload)).rejects.toThrow(error);
    expect(prisma.produto.create).not.toHaveBeenCalled();
  });
});
