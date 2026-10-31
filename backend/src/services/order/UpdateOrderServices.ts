import prismaClient from "../../prisma";

interface UpdateOrderRequest {
  id: string;
  quantidade: number;
  user_id: string;
}

class UpdateOrderService {
  async execute({ id, quantidade, user_id }: UpdateOrderRequest) {
    const qtd = Number(quantidade);

    if (!id) throw new Error("Dados ausentes");

    if (!Number.isInteger(qtd) || qtd <= 0) {
      throw new Error("A quantidade deve ser um número inteiro maior que zero.");
    }

    const item = await prismaClient.itemCompra.findUnique({
      where: { id },
      include: {
        compra: { select: { id_usuario: true, status: true } },
        produto: { select: { estoque: true, nome: true } },
      },
    });

    if (!item) throw new Error("Item não encontrado.");
    if (item.compra.id_usuario !== user_id) throw new Error("Acesso negado.");
    // Antes dava para alterar itens de um pedido que já estava em pagamento.
    if (item.compra.status !== 'CARRINHO') throw new Error("Este pedido já foi processado.");

    if (qtd > item.produto.estoque) {
      throw new Error(`Só temos ${item.produto.estoque} unidade(s) de "${item.produto.nome}" em estoque.`);
    }

    return prismaClient.itemCompra.update({
      where: { id },
      data: { quantidade: qtd },
    });
  }
}

export { UpdateOrderService };
