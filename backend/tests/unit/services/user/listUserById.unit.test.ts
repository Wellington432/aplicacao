import prisma from '../../../../src/prisma';
import { ListUserByIdService } from '../../../../src/services/user/ListUserByIdService';

describe('ListUserByIdService.execute', () => {
  it('deve buscar usuário pelos campos públicos', async () => {
    const user = { id: 'user-1', nome: 'Ana', email: 'ana@example.test', tipo: 'CLIENTE' };
    (prisma.usuario.findFirst as jest.Mock).mockResolvedValue(user);

    await expect(new ListUserByIdService().execute({ id: user.id })).resolves.toBe(user);
    expect(prisma.usuario.findFirst).toHaveBeenCalledWith({
      where: { id: user.id },
      select: { id: true, nome: true, email: true, tipo: true },
    });
  });

  it('deve rejeitar identificador ausente', async () => {
    await expect(new ListUserByIdService().execute({ id: '' })).rejects.toThrow(
      'Dados ausentes!',
    );
  });
});
