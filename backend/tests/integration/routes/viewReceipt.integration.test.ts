import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { app } from '../../../src/app';
import prisma from '../../../src/prisma';
import { COMPROVANTES_DIR } from '../../../src/middlewares/multerConfig';
import { authHeader, createCart, createUser } from '../../helpers/integrationFixtures';

describe('GET /checkout/:id_compra/comprovante', () => {
  it('deve servir comprovante somente ao proprietário autenticado', async () => {
    const user = await createUser();
    const cart = await createCart(user.id, 'AGUARDANDO_PAGAMENTO');
    const filename = `${randomUUID()}.pdf`;
    await fs.writeFile(path.join(COMPROVANTES_DIR, filename), '%PDF-test');
    await prisma.compra.update({
      where: { id: cart.id },
      data: { comprovante_url: filename },
    });

    const response = await request(app)
      .get(`/checkout/${cart.id}/comprovante`)
      .set(authHeader(user));

    expect(response.status).toBe(200);
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    await fs.unlink(path.join(COMPROVANTES_DIR, filename));
  });
});
