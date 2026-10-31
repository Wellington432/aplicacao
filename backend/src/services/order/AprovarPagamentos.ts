import prismaClient from "../../prisma";

class AprovarPagamentoService {
  async execute({ id, confirmado_por }: { id: string; confirmado_por: string }) {
    return prismaClient.$transaction(async (tx) => {
      const compra = await tx.compra.findUnique({
        where: { id },
        include: { itens: { include: { produto: { select: { nome: true } } } } },
      });

      if (!compra) {
        throw new Error("Pedido não encontrado");
      }

      if (compra.status !== "AGUARDANDO_CONFIRMACAO") {
        throw new Error("Este pedido não está aguardando aprovação");
      }

      // Baixa o estoque (antes o estoque nunca diminuía após uma venda).
      // O updateMany com "gte" garante que o estoque não fica negativo
      // mesmo se dois pedidos forem aprovados ao mesmo tempo.
      for (const item of compra.itens) {
        const { count } = await tx.produto.updateMany({
          where: { id: item.id_produto, estoque: { gte: item.quantidade } },
          data: { estoque: { decrement: item.quantidade } },
        });

        if (count === 0) {
          throw new Error(`Estoque insuficiente para "${item.produto.nome}". Ajuste o estoque antes de aprovar.`);
        }
      }

      return tx.compra.update({
        where: { id },
        data: { status: "PAGO", confirmado_por, confirmado_em: new Date() },
      });
    });
  }
}

export { AprovarPagamentoService };
