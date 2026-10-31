import fs from 'node:fs';
import prisma from '../../../../src/prisma';
import { EnviarComprovanteService } from '../../../../src/services/order/EnviarComprovanteServices';

describe('EnviarComprovanteService.execute', () => {
  it('deve anexar comprovante de pedido aguardando pagamento', async () => {
    (prisma.compra.findUnique as jest.Mock).mockResolvedValue({
      id_usuario: 'user-1',
      status: 'AGUARDANDO_PAGAMENTO',
      comprovante_url: null,
    });
    (prisma.compra.update as jest.Mock).mockResolvedValue({});

    await expect(
      new EnviarComprovanteService().execute({
        id: 'cart-1',
        user_id: 'user-1',
        nomeArquivo: 'proof.png',
      }),
    ).resolves.toEqual({ status: 'AGUARDANDO_CONFIRMACAO' });
    expect(prisma.compra.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'cart-1' },
        data: expect.objectContaining({
          comprovante_url: 'proof.png',
          status: 'AGUARDANDO_CONFIRMACAO',
        }),
      }),
    );
  });

  it('deve remover novo arquivo ao rejeitar pedido ou usuário', async () => {
    const unlink = jest.spyOn(fs.promises, 'unlink').mockResolvedValue(undefined);
    (prisma.compra.findUnique as jest.Mock).mockResolvedValue({
      id_usuario: 'other-user',
      status: 'AGUARDANDO_PAGAMENTO',
    });

    await expect(
      new EnviarComprovanteService().execute({
        id: 'cart-1',
        user_id: 'user-1',
        nomeArquivo: 'proof.png',
      }),
    ).rejects.toThrow('Acesso negado.');
    expect(unlink).toHaveBeenCalledTimes(1);
  });
});
