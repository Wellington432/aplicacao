import prismaClient from "../../prisma";

interface DeleteOrderRequest {
  id: string;
  user_id: string;
}

class DeleteOrderServices {
  async execute({ id, user_id }: DeleteOrderRequest) {
    if (!id) {
      throw new Error("Dados ausentes");
    }

    const item = await prismaClient.itemCompra.findUnique({
      where: { id },
      include: { compra: { select: { id_usuario: true, status: true } } }
    });

    if (!item) throw new Error("Item não encontrado.");
    if (item.compra.id_usuario !== user_id) throw new Error("Acesso negado.");
    if (item.compra.status !== 'CARRINHO') throw new Error("Este pedido já foi processado.");

    return prismaClient.itemCompra.delete({ where: { id } });
  }
}

export { DeleteOrderServices };
