import prismaClient from '../src/prisma';

async function main() {
  const email = process.argv[2]?.trim();

  if (!email) {
    console.error('Uso: npm run make-admin -- <email>');
    process.exit(1);
  }

  const usuario = await prismaClient.usuario.updateMany({
    where: { email: { equals: email, mode: 'insensitive' } },
    data: { tipo: 'ADM' },
  });

  console.log(`Atualizados ${usuario.count} usuário(s) para ADM: ${email}`);
}

main()
  .catch((error) => {
    console.error('Erro ao tornar usuário administrador:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prismaClient.$disconnect();
  });
