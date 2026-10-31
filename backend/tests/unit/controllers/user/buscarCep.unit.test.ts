import { EnderecoController } from '../../../../src/controllers/user/EnderecoController';
import { createRequest, createResponse } from '../../../helpers/httpMocks';

describe('EnderecoController.buscarCep', () => {
  afterEach(() => jest.restoreAllMocks());

  it('deve normalizar CEP e retornar endereço encontrado', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        cep: '12345-678',
        logradouro: 'Rua A',
        bairro: 'Centro',
        localidade: 'Jales',
        uf: 'SP',
      }),
    } as Response);
    const res = createResponse();

    await new EnderecoController().buscarCep(createRequest({ params: { cep: '12345-678' } }), res);

    expect(fetchSpy).toHaveBeenCalledWith('https://viacep.com.br/ws/12345678/json/');
    expect(res.json).toHaveBeenCalledWith({
      cep: '12345-678',
      logradouro: 'Rua A',
      bairro: 'Centro',
      cidade: 'Jales',
      estado: 'SP',
    });
  });

  it('deve retornar 400, 404 ou 502 conforme erro de consulta', async () => {
    const controller = new EnderecoController();
    const invalid = createResponse();
    await controller.buscarCep(createRequest({ params: { cep: '123' } }), invalid);
    expect(invalid.status).toHaveBeenCalledWith(400);

    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ erro: true }),
    } as Response);
    const missing = createResponse();
    await controller.buscarCep(createRequest({ params: { cep: '12345678' } }), missing);
    expect(missing.status).toHaveBeenCalledWith(404);

    jest.spyOn(global, 'fetch').mockRejectedValue(new Error('network error'));
    const unavailable = createResponse();
    await controller.buscarCep(createRequest({ params: { cep: '12345678' } }), unavailable);
    expect(unavailable.status).toHaveBeenCalledWith(502);
  });
});
