import prisma from '../../../src/prisma';
import { isAdmin } from '../../../src/middlewares/isAdmin';
import { createAuthRequest, createResponse } from '../../helpers/httpMocks';

describe('isAdmin', () => {
  it('deve liberar administrador', async () => {
    (prisma.usuario.findUnique as jest.Mock).mockResolvedValue({ tipo: 'ADM' });
    const next = jest.fn();

    await isAdmin(createAuthRequest(), createResponse(), next);
    expect(prisma.usuario.findUnique).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      select: { tipo: true },
    });
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('deve negar usuário que não seja administrador', async () => {
    (prisma.usuario.findUnique as jest.Mock).mockResolvedValue({ tipo: 'CLIENTE' });
    const res = createResponse();
    await isAdmin(createAuthRequest(), res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Acesso negado. Apenas administradores.',
    });
  });
});
