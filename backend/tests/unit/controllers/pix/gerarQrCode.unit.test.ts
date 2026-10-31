jest.mock('../../../../src/modulos/pix/PixServices', () => ({
  gerarPayloadPix: jest.fn(() => 'pix-code'),
  obterDadosRecebedorPix: jest.fn(() => ({
    chavePix: 'test-key',
    nomeRecebedor: 'LOJA',
    cidade: 'JALES',
  })),
}));
jest.mock('qrcode', () => ({
  __esModule: true,
  default: { toDataURL: jest.fn().mockResolvedValue('data:image/png;base64,test') },
}));

import prisma from '../../../../src/prisma';
import { gerarQrCode } from '../../../../src/modulos/pix/PixController';
import { createAuthRequest, createResponse } from '../../../helpers/httpMocks';

describe('gerarQrCode', () => {
  it('deve retornar 404 para compra inexistente', async () => {
    (prisma.compra.findUnique as jest.Mock).mockResolvedValue(null);
    const res = createResponse();
    await gerarQrCode(createAuthRequest({ params: { compraId: 'cart-1' } }), res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('deve impedir acesso ao Pix de outro usuário', async () => {
    (prisma.compra.findUnique as jest.Mock).mockResolvedValue({
      id_usuario: 'owner',
      status: 'AGUARDANDO_PAGAMENTO',
    });
    const res = createResponse();
    await gerarQrCode(createAuthRequest({ params: { compraId: 'cart-1' } }), res);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('deve gerar QR Code para pedido finalizado do proprietário', async () => {
    (prisma.compra.findUnique as jest.Mock).mockResolvedValue({
      id_usuario: 'user-1',
      status: 'AGUARDANDO_PAGAMENTO',
      total: '12.50',
    });
    const res = createResponse();
    await gerarQrCode(createAuthRequest({ params: { compraId: 'cart-1' } }), res);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ brCode: 'pix-code', total: 12.5, status: 'AGUARDANDO_PAGAMENTO' }),
    );
  });
});
