import request from 'supertest';
import { app } from '../../../src/app';
import { authHeader, createUser } from '../../helpers/integrationFixtures';

describe('GET /relatoriovendas', () => {
  it('deve permitir acesso a administrador e retornar estrutura do relatório', async () => {
    const admin = await createUser('ADM');
    const response = await request(app)
      .get('/relatoriovendas?dias=7')
      .set(authHeader(admin));

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      periodo_dias: 7,
      receita_total: 0,
      pedidos_finalizados: 0,
      receita_por_dia: expect.any(Array),
    });
  });
});
