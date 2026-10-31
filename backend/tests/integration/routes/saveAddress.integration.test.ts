import request from 'supertest';
import { app } from '../../../src/app';
import prisma from '../../../src/prisma';
import { authHeader, createUser } from '../../helpers/integrationFixtures';

describe('POST /endereco', () => {
  it('deve normalizar e persistir endereço do usuário autenticado', async () => {
    const user = await createUser();
    const response = await request(app)
      .post('/endereco')
      .set(authHeader(user))
      .send({
        cep: '12345-678',
        logradouro: 'Rua A',
        bairro: 'Centro',
        cidade: 'Jales',
        estado: 'sp',
        numero: '10',
      });

    expect(response.status).toBe(200);
    expect(response.body.cep).toBe('12345678');
    expect(response.body.id_usuario).toBe(user.id);
    await expect(prisma.endereco.findUnique({ where: { id_usuario: user.id } })).resolves.toBeTruthy();
  });

  it('deve rejeitar endereço incompleto', async () => {
    const user = await createUser();
    const response = await request(app)
      .post('/endereco')
      .set(authHeader(user))
      .send({ cep: '12' });
    expect(response.status).toBe(400);
  });
});
