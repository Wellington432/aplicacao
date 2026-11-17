import prismaClient from "../../prisma";

class ListCategoryService {
    async execute() {
        const categorias = await prismaClient.categoria.findMany({
            select: { id: true, nome: true, iconKey: true, iconUrl: true },
            orderBy: { nome: 'asc' }
        });
        return categorias;
    }
}

export { ListCategoryService };
