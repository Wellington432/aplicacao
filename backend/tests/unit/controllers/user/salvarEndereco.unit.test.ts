import prisma from '../../../../src/prisma';
import { EnderecoController } from '../../../../src/controllers/user/EnderecoController';
import { createAuthRequest, createResponse } from '../../../helpers/httpMocks';

describe('EnderecoController.salvar', () => {
  it('deve rejeitar CEP ou campos obrigatórios ausentes', async () => {
    const res = createResponse();
    await new EnderecoController().salvar(createAuthRequest({ body: { cep: '123' } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(prisma.endereco.upsert).not.toHaveBeenCalled();
  });

  it('deve normalizar campos e fazer upsert do endereço autenticado', async () => {
    const payload = {
      cep: '12345-678',
      logradouro: ' Rua A ',
      bairro: ' Centro ',
      cidade: ' Jales ',
      estado: 'sp',
      numero: ' 10 ',
      complemento: ' ',
    };
    (prisma.endereco.upsert as jest.Mock).mockResolvedValue({ id: 'address-1' });
    const res = createResponse();

    await new EnderecoController().salvar(createAuthRequest({ body: payload }), res);

    expect(prisma.endereco.upsert).toHaveBeenCalledWith({
      where: { id_usuario: 'user-1' },
      create: {
        id_usuario: 'user-1',
        cep: '12345678',
        logradouro: 'Rua A',
        bairro: 'Centro',
        cidade: 'Jales',
        estado: 'SP',
        numero: '10',
        complemento: null,
      },
      update: {
        cep: '12345678',
        logradouro: 'Rua A',
        bairro: 'Centro',
        cidade: 'Jales',
        estado: 'SP',
        numero: '10',
        complemento: null,
      },
    });
    expect(res.json).toHaveBeenCalledWith({ id: 'address-1' });
  });
});
