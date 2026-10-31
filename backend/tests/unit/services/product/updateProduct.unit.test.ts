import { UpdateProductServices } from '../../../../src/services/product/UpdateProdutoServices';
import prisma from '../../../../src/prisma';

const update = {
  id: 'product-1',
  nome: 'Maçã',
  preco: 2.5,
  unidade: 'kg',
  descricao: 'Fresca',
  id_categoria: 'category-1',
  estoque: 4,
};

describe('UpdateProductServices.execute', () => {
  it('deve atualizar dados e manter banner se não enviado', async () => {
    (prisma.produto.update as jest.Mock).mockResolvedValue({ id: update.id });

    await new UpdateProductServices().execute({ ...update, ativo: false });
    expect(prisma.produto.update).toHaveBeenCalledWith({
      where: { id: update.id },
      data: {
        nome: update.nome,
        preco: update.preco,
        unidade: update.unidade,
        descricao: update.descricao,
        id_categoria: update.id_categoria,
        estoque: update.estoque,
        ativo: false,
      },
    });
  });

  it.each([
    [{ ...update, id: '' }, 'Dados ausentes'],
    [{ ...update, preco: 0 }, 'Preço inválido'],
    [{ ...update, estoque: -1 }, 'Estoque não pode ser negativo'],
  ])('deve rejeitar dados inválidos', async (payload, error) => {
    await expect(new UpdateProductServices().execute(payload)).rejects.toThrow(error);
    expect(prisma.produto.update).not.toHaveBeenCalled();
  });
});
