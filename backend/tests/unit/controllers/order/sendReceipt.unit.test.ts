jest.mock('../../../../src/services/order/EnviarComprovanteServices', () => ({
  EnviarComprovanteService: jest.fn().mockImplementation(() => ({ execute: jest.fn().mockResolvedValue({ status: 'AGUARDANDO_CONFIRMACAO' }) })),
}));

import { EnviarComprovanteController } from '../../../../src/controllers/order/EnviarComprovanteController';
import { EnviarComprovanteService } from '../../../../src/services/order/EnviarComprovanteServices';
import { createAuthRequest, createResponse } from '../../../helpers/httpMocks';

describe('EnviarComprovanteController.handle', () => {
  it('deve retornar 400 quando arquivo não foi enviado', async () => {
    const res = createResponse();
    await new EnviarComprovanteController().handle(createAuthRequest(), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(EnviarComprovanteService).not.toHaveBeenCalled();
  });

  it('deve enviar identificador, usuário e nome do arquivo ao serviço', async () => {
    const res = createResponse();
    await new EnviarComprovanteController().handle(
      createAuthRequest({
        params: { id_compra: 'cart-1' },
        file: { filename: 'proof.pdf' },
      }),
      res,
    );
    expect((EnviarComprovanteService as jest.Mock).mock.results[0].value.execute).toHaveBeenCalledWith({
      id: 'cart-1',
      user_id: 'user-1',
      nomeArquivo: 'proof.pdf',
    });
    expect(res.json).toHaveBeenCalledWith({ status: 'AGUARDANDO_CONFIRMACAO' });
  });
});
