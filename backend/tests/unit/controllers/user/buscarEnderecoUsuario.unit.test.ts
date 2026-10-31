import prisma from '../../../../src/prisma';
import { EnderecoController } from '../../../../src/controllers/user/EnderecoController';
import { createAuthRequest, createResponse } from '../../../helpers/httpMocks';

describe('EnderecoController.buscarDoUsuario', () => {
  it('deve negar acesso ao endereço de outro usuário', async () => {
    const res = createResponse();
    await new EnderecoController().buscarDoUsuario(
      createAuthRequest({ params: { userId: 'other' } }),
      res,
    );
    expect(res.status).toHaveBeenCalledWith(403);
    expect(prisma.endereco.findUnique).not.toHaveBeenCalled();
  });

  it('deve consultar o endereço do usuário autenticado', async () => {
    const address = { cidade: 'Jales' };
    (prisma.endereco.findUnique as jest.Mock).mockResolvedValue(address);
    const res = createResponse();
    await new EnderecoController().buscarDoUsuario(
      createAuthRequest({ params: { userId: 'user-1' } }),
      res,
    );
    expect(prisma.endereco.findUnique).toHaveBeenCalledWith({ where: { id_usuario: 'user-1' } });
    expect(res.json).toHaveBeenCalledWith(address);
  });
});
