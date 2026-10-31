import { Prisma } from '@prisma/client';
import { MulterError } from 'multer';
import { ClientError } from '../../../src/errors/ClientError';
import { errorHandler } from '../../../src/app';
import { createRequest, createResponse } from '../../helpers/httpMocks';

describe('errorHandler', () => {
  const next = jest.fn();
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    errorSpy.mockRestore();
    process.env.NODE_ENV = 'test';
  });

  function prismaError(code: string) {
    return new Prisma.PrismaClientKnownRequestError('database error', {
      code,
      clientVersion: 'test',
      meta: { target: 'email' },
    });
  }

  it('deve mapear erros conhecidos do Prisma a status apropriados', () => {
    const cases = [
      [prismaError('P2025'), 404, 'Registro não encontrado.'],
      [prismaError('P2002'), 409, 'Email já Cadastrado!'],
      [prismaError('P2003'), 400, 'Referência inválida (categoria/produto inexistente).'],
      [prismaError('P1000'), 400, 'Erro na operação com o banco de dados.'],
    ] as const;

    for (const [error, status, message] of cases) {
      const res = createResponse();
      errorHandler(error, createRequest(), res, next);
      expect(res.status).toHaveBeenCalledWith(status);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: message, codigo: error.code }),
      );
    }
  });

  it('deve ocultar detalhes de erros Prisma em produção', () => {
    process.env.NODE_ENV = 'production';
    const res = createResponse();

    errorHandler(prismaError('P2002'), createRequest(), res, next);

    expect(res.json).toHaveBeenCalledWith({ error: 'Email já Cadastrado!' });
  });

  it('deve mapear erro de validação Prisma e erro Multer por tamanho', () => {
    const validation = new Prisma.PrismaClientValidationError('invalid data', {
      clientVersion: 'test',
    });
    const validationRes = createResponse();
    errorHandler(validation, createRequest(), validationRes, next);
    expect(validationRes.status).toHaveBeenCalledWith(400);
    expect(validationRes.json).toHaveBeenCalledWith({ error: 'Dados inválidos.' });

    const fileRes = createResponse();
    errorHandler(new MulterError('LIMIT_FILE_SIZE'), createRequest(), fileRes, next);
    expect(fileRes.json).toHaveBeenCalledWith({ error: 'Arquivo muito grande (máx. 5MB).' });
  });

  it('deve responder erro genérico para Multer e Error comum', () => {
    const multerRes = createResponse();
    errorHandler(new MulterError('LIMIT_UNEXPECTED_FILE'), createRequest(), multerRes, next);
    expect(multerRes.json).toHaveBeenCalledWith({ error: 'Erro no envio do arquivo.' });

    const errorRes = createResponse();
    errorHandler(new Error('request failed'), createRequest(), errorRes, next);
    expect(errorRes.status).toHaveBeenCalledWith(400);
    expect(errorRes.json).toHaveBeenCalledWith({ error: 'request failed' });
  });

  it('não deve registrar erro de requisição esperado', () => {
    const res = createResponse();

    errorHandler(new ClientError('Credencial do Google ausente.'), createRequest(), res, next);

    expect(errorSpy).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Credencial do Google ausente.' });
  });

  it('deve responder 500 para valor que não seja Error', () => {
    const res = createResponse();
    errorHandler(null as unknown as Error, createRequest(), res, next);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Erro interno do servidor.' });
  });
});
