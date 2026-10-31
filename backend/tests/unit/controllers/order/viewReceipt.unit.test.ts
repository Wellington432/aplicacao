import fs from 'node:fs';
import prisma from '../../../../src/prisma';
import { VerComprovanteController } from '../../../../src/controllers/order/VerComprovanteController';
import { createAuthRequest, createResponse } from '../../../helpers/httpMocks';

describe('VerComprovanteController.handle', () => {
  afterEach(() => jest.restoreAllMocks());

  it('deve retornar 404 quando compra ou comprovante não existir', async () => {
    (prisma.compra.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.usuario.findUnique as jest.Mock).mockResolvedValue({ tipo: 'CLIENTE' });
    const res = createResponse();

    await new VerComprovanteController().handle(
      createAuthRequest({ params: { id_compra: 'cart-1' } }),
      res,
    );
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('deve impedir download por usuário que não seja dono ou administrador', async () => {
    (prisma.compra.findUnique as jest.Mock).mockResolvedValue({
      id_usuario: 'owner',
      comprovante_url: 'proof.pdf',
    });
    (prisma.usuario.findUnique as jest.Mock).mockResolvedValue({ tipo: 'CLIENTE' });
    const res = createResponse();

    await new VerComprovanteController().handle(
      createAuthRequest({ params: { id_compra: 'cart-1' } }),
      res,
    );
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('deve servir comprovante ao dono com headers privados', async () => {
    (prisma.compra.findUnique as jest.Mock).mockResolvedValue({
      id_usuario: 'user-1',
      comprovante_url: 'folder/proof.pdf',
    });
    (prisma.usuario.findUnique as jest.Mock).mockResolvedValue({ tipo: 'CLIENTE' });
    jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    const res = createResponse();

    await new VerComprovanteController().handle(
      createAuthRequest({ params: { id_compra: 'cart-1' } }),
      res,
    );
    expect(res.setHeader).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff');
    expect(res.setHeader).toHaveBeenCalledWith('Cache-Control', 'private, no-store');
    expect(res.sendFile).toHaveBeenCalledWith(expect.stringContaining('proof.pdf'));
  });
});
