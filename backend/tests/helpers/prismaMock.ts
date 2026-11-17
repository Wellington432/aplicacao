const mockMethod = () => jest.fn();

const mockPrisma = {
  categoria: { create: mockMethod(), findMany: mockMethod() },
  produto: {
    create: mockMethod(),
    findMany: mockMethod(),
    findUnique: mockMethod(),
    update: mockMethod(),
    updateMany: mockMethod(),
  },
  usuario: {
    create: mockMethod(),
    findFirst: mockMethod(),
    findUnique: mockMethod(),
    update: mockMethod(),
  },
  compra: {
    create: mockMethod(),
    count: mockMethod(),
    findFirst: mockMethod(),
    findMany: mockMethod(),
    findUnique: mockMethod(),
    update: mockMethod(),
  },
  itemCompra: {
    create: mockMethod(),
    delete: mockMethod(),
    deleteMany: mockMethod(),
    findFirst: mockMethod(),
    findUnique: mockMethod(),
    update: mockMethod(),
  },
  endereco: { findUnique: mockMethod(), upsert: mockMethod() },
  recuperacaoSenha: {
    create: mockMethod(),
    deleteMany: mockMethod(),
    findUnique: mockMethod(),
  },
  $transaction: mockMethod(),
  $disconnect: mockMethod(),
};

export function resetPrismaMocks() {
  Object.values(mockPrisma).forEach((model) => {
    if (typeof model === 'function') {
      model.mockReset();
      return;
    }
    Object.values(model).forEach((method) => method.mockReset());
  });
}

export default mockPrisma;
