import request from 'supertest';
import { app } from '../../../src/app';
import prisma from '../../../src/prisma';
import { authHeader, createUser } from '../../helpers/integrationFixtures';

describe('PATCH /rejeitarpagamento/:id', () => {
  it('deve rejeitar pedido pendente e registrar status', async () => {
    const admin = await createUser('ADM');
    const owner = await createUser();
    const order = await prisma.compra.create({
      data: { id_usuario: owner.id, status: 'AGUARDANDO_CONFIRMACAO' },
    });
    const response = await request(app)
      .patch(`/rejeitarpagamento/${order.id}`)
      .set(authHeader(admin));

    expect(response.status).toBe(200);
    await expect(prisma.compra.findUnique({ where: { id: order.id } })).resolves.toMatchObject({
      status: 'REJEITADO',
    });
  });
});
