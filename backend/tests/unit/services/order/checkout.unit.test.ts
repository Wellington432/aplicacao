jest.mock('../../../../src/modulos/pix/PixServices', () => ({
  gerarPayloadPix: jest.fn(() => 'pix-code'),
  obterDadosRecebedorPix: jest.fn(() => ({
    chavePix: 'test-key',
    nomeRecebedor: 'LOJA',
    cidade: 'JALES',
  })),
}));
jest.mock('qrcode', () => ({
  __esModule: true,
  default: { toDataURL: jest.fn().mockResolvedValue('data:image/png;base64,test') },
}));

import prisma from '../../../../src/prisma';
import { CheckoutService } from '../../../../src/services/order/CheckoutService';

describe('CheckoutService.execute', () => {
  const tx = {
    endereco: { upsert: jest.fn() },
    itemCompra: { update: jest.fn() },
    compra: { update: jest.fn() },
  };

  beforeEach(() => {
    tx.endereco.upsert.mockReset();
    tx.itemCompra.update.mockReset();
    tx.compra.update.mockReset();
    (prisma.$transaction as jest.Mock).mockImplementation(
      (callback: (transaction: typeof tx) => unknown) => callback(tx),
    );
  });

  it('deve finalizar retirada calculando total em centavos', async () => {
    (prisma.compra.findUnique as jest.Mock).mockResolvedValue({
      id_usuario: 'user-1',
      status: 'CARRINHO',
      itens: [
        {
          id: 'item-1',
          quantidade: 3,
          produto: { id: 'prod-1', nome: 'Maçã', preco: 0.1, estoque: 5, ativo: true },
        },
        {
          id: 'item-2',
          quantidade: 1,
          produto: { id: 'prod-2', nome: 'Pera', preco: 0.2, estoque: 2, ativo: true },
        },
      ],
    });

    await expect(
      new CheckoutService().execute({
        id_compra: 'cart-1',
        tipo_entrega: 'RETIRADA',
        user_id: 'user-1',
      }),
    ).resolves.toMatchObject({ total: 0.5, copia_cola: 'pix-code' });
    expect(tx.compra.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'cart-1' },
        data: expect.objectContaining({ status: 'AGUARDANDO_PAGAMENTO', total: 0.5 }),
      }),
    );
  });

  it.each([
    [null, 'Compra não encontrada.'],
    [{ id_usuario: 'other', status: 'CARRINHO', itens: [] }, 'Acesso negado.'],
    [{ id_usuario: 'user-1', status: 'PAGO', itens: [] }, 'já foi processado'],
    [{ id_usuario: 'user-1', status: 'CARRINHO', itens: [] }, 'carrinho está vazio'],
  ])('deve rejeitar pedido que não possa finalizar', async (cart, error) => {
    (prisma.compra.findUnique as jest.Mock).mockResolvedValue(cart);

    await expect(
      new CheckoutService().execute({
        id_compra: 'cart-1',
        tipo_entrega: 'RETIRADA',
        user_id: 'user-1',
      }),
    ).rejects.toThrow(error);
  });

  it('deve rejeitar item desativado ou sem estoque suficiente', async () => {
    (prisma.compra.findUnique as jest.Mock).mockResolvedValue({
      id_usuario: 'user-1',
      status: 'CARRINHO',
      itens: [
        {
          id: 'item-1',
          quantidade: 2,
          produto: { id: 'prod-1', nome: 'Maçã', preco: 1, estoque: 1, ativo: true },
        },
      ],
    });
    await expect(
      new CheckoutService().execute({
        id_compra: 'cart-1',
        tipo_entrega: 'RETIRADA',
        user_id: 'user-1',
      }),
    ).rejects.toThrow('Estoque insuficiente para "Maçã".');
  });

  it('deve rejeitar tipo de entrega desconhecido', async () => {
    (prisma.compra.findUnique as jest.Mock).mockResolvedValue({
      id_usuario: 'user-1',
      status: 'CARRINHO',
      itens: [{ id: 'item-1', quantidade: 1, produto: { ativo: true, estoque: 2 } }],
    });

    await expect(
      new CheckoutService().execute({
        id_compra: 'cart-1',
        tipo_entrega: 'INVALIDA' as never,
        user_id: 'user-1',
      }),
    ).rejects.toThrow('Tipo de entrega inválido.');
  });

  it('deve validar disponibilidade regional e campos do endereço', async () => {
    (prisma.compra.findUnique as jest.Mock).mockResolvedValue({
      id_usuario: 'user-1',
      status: 'CARRINHO',
      itens: [{ id: 'item-1', quantidade: 1, produto: { ativo: true, estoque: 2 } }],
    });
    (prisma.endereco.findUnique as jest.Mock).mockResolvedValue(null);
    const service = new CheckoutService();
    await expect(
      service.execute({ id_compra: 'cart-1', tipo_entrega: 'ENTREGA', user_id: 'user-1' }),
    ).rejects.toThrow('Cadastre seu endereço');

    await expect(
      service.execute({
        id_compra: 'cart-1',
        tipo_entrega: 'ENTREGA',
        user_id: 'user-1',
        endereco: {
          cep: '123',
          logradouro: '',
          bairro: 'Centro',
          cidade: 'Jales',
          estado: 'SP',
          numero: '1',
        },
      }),
    ).rejects.toThrow('Preencha um endereço válido');

    await expect(
      service.execute({
        id_compra: 'cart-1',
        tipo_entrega: 'ENTREGA',
        user_id: 'user-1',
        endereco: {
          cep: '12345678',
          logradouro: 'Rua A',
          bairro: 'Centro',
          cidade: 'Bauru',
          estado: 'SP',
          numero: '1',
        },
      }),
    ).rejects.toThrow('Entregas disponíveis apenas para Jales-SP');
  });

  it('deve aceitar endereço válido, persistir endereço novo e incluir frete', async () => {
    const oldFreight = process.env.FRETE_ENTREGA;
    process.env.FRETE_ENTREGA = '3.25';
    (prisma.compra.findUnique as jest.Mock).mockResolvedValue({
      id_usuario: 'user-1',
      status: 'CARRINHO',
      itens: [
        {
          id: 'item-1',
          quantidade: 2,
          produto: { id: 'prod-1', nome: 'Maçã', preco: 2.5, estoque: 2, ativo: true },
        },
      ],
    });

    try {
      const result = await new CheckoutService().execute({
        id_compra: 'cart-1',
        tipo_entrega: 'ENTREGA',
        user_id: 'user-1',
        endereco: {
          cep: '12345-678',
          logradouro: ' Rua A ',
          bairro: ' Centro ',
          cidade: ' Jales ',
          estado: 'sp',
          numero: ' 10 ',
          complemento: ' Casa ',
        },
      });

      expect(result.total).toBe(8.25);
      expect(tx.endereco.upsert).toHaveBeenCalledWith({
        where: { id_usuario: 'user-1' },
        create: {
          id_usuario: 'user-1',
          cep: '12345678',
          logradouro: 'Rua A',
          bairro: 'Centro',
          cidade: 'Jales',
          estado: 'SP',
          numero: '10',
          complemento: 'Casa',
        },
        update: {
          cep: '12345678',
          logradouro: 'Rua A',
          bairro: 'Centro',
          cidade: 'Jales',
          estado: 'SP',
          numero: '10',
          complemento: 'Casa',
        },
      });
    } finally {
      if (oldFreight === undefined) delete process.env.FRETE_ENTREGA;
      else process.env.FRETE_ENTREGA = oldFreight;
    }
  });
});
