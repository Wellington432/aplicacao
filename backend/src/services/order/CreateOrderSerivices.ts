import prismaClient from "../../prisma";

interface OrderRequest {
  id_compra: string;
  id_produto: string;
  quantidade: number;
  user_id: string;
}

class CreateOrderService {
  async execute({ id_compra, id_produto, quantidade, user_id }: OrderRequest) {
    const qtd = Number(quantidade);

    if (!id_compra || !id_produto || !qtd) {
      throw new Error("Dados ausentes");
    }

    if (!Number.isInteger(qtd) || qtd <= 0) {
      throw new Error("A quantidade deve ser um número inteiro maior que zero.");
    }

    const compra = await prismaClient.compra.findUnique({
      where: { id: id_compra },
      select: { id_usuario: true, status: true },
    });

    if (!compra) throw new Error("Carrinho não encontrado.");
    if (compra.id_usuario !== user_id) throw new Error("Acesso negado.");
    if (compra.status !== 'CARRINHO') throw new Error("Este pedido já foi processado.");

    const produto = await prismaClient.produto.findUnique({
      where: { id: id_produto },
      select: { ativo: true, estoque: true, nome: true },
    });

    if (!produto || !produto.ativo) throw new Error("Produto indisponível.");

    // Se o produto já está no carrinho, soma a quantidade em vez de criar
    // uma linha duplicada (antes cada clique no "+" gerava um item novo).
    const existente = await prismaClient.itemCompra.findFirst({
      where: { id_compra, id_produto },
    });

    const novaQuantidade = (existente?.quantidade ?? 0) + qtd;

    if (novaQuantidade > produto.estoque) {
      throw new Error(
        produto.estoque <= 0
          ? `"${produto.nome}" está sem estoque.`
          : `Só temos ${produto.estoque} unidade(s) de "${produto.nome}" em estoque.`
      );
    }

    if (existente) {
      return prismaClient.itemCompra.update({
        where: { id: existente.id },
        data: { quantidade: novaQuantidade },
      });
    }

    return prismaClient.itemCompra.create({
      data: { quantidade: qtd, id_compra, id_produto },
    });
  }
}

export { CreateOrderService };
