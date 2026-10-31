import fs from 'fs';
import path from 'path';
import prismaClient from '../../prisma';
import { COMPROVANTES_DIR } from '../../middlewares/multerConfig';

interface EnviarComprovanteRequest {
  id: string;
  user_id: string;
  nomeArquivo: string;
}

function removerArquivo(nome: string) {
  fs.promises.unlink(path.join(COMPROVANTES_DIR, nome)).catch(() => undefined);
}

class EnviarComprovanteService {
  async execute({ id, user_id, nomeArquivo }: EnviarComprovanteRequest) {
    const compra = await prismaClient.compra.findUnique({ where: { id } });

    try {
      if (!compra) throw new Error('Compra não encontrada.');
      if (compra.id_usuario !== user_id) throw new Error('Acesso negado.');
      // REJEITADO também pode reenviar: antes o cliente ficava travado sem conseguir corrigir.
      if (compra.status !== 'AGUARDANDO_PAGAMENTO' && compra.status !== 'REJEITADO') {
        throw new Error('Este pedido não está aguardando pagamento.');
      }
    } catch (err) {
      // O multer já salvou o arquivo antes da validação; apaga para não acumular lixo.
      removerArquivo(nomeArquivo);
      throw err;
    }

    await prismaClient.compra.update({
      where: { id },
      data: {
        comprovante_url: nomeArquivo,
        comprovante_enviado_em: new Date(),
        status: 'AGUARDANDO_CONFIRMACAO',
        confirmado_por: null,
        confirmado_em: null,
      },
    });

    // Apaga o comprovante anterior (rejeitado), se houver.
    if (compra.comprovante_url) removerArquivo(path.basename(compra.comprovante_url));

    return { status: 'AGUARDANDO_CONFIRMACAO' };
  }
}

export { EnviarComprovanteService };
