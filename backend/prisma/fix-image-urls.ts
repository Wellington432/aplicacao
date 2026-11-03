import prismaClient from '../src/prisma';

function isLocalhost(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

async function main() {
  const products = await prismaClient.produto.findMany({
    where: { banner: { startsWith: 'http://' } },
    select: { id: true, banner: true },
  });

  let updatedCount = 0;

  for (const product of products) {
    const imageUrl = new URL(product.banner);
    if (isLocalhost(imageUrl.hostname)) continue;

    imageUrl.protocol = 'https:';
    await prismaClient.produto.update({
      where: { id: product.id },
      data: { banner: imageUrl.toString() },
    });
    updatedCount += 1;
  }

  console.log(`URLs de imagem atualizadas: ${updatedCount}`);
}

main()
  .catch((error) => {
    console.error('Erro ao corrigir URLs das imagens:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prismaClient.$disconnect();
  });
