process.env.NODE_ENV = 'test';

jest.mock('../../src/prisma', () => require('../helpers/prismaMock'));

import mockPrisma, { resetPrismaMocks } from '../helpers/prismaMock';

beforeEach(() => {
  jest.clearAllMocks();
  resetPrismaMocks();
});

afterAll(async () => {
  await mockPrisma.$disconnect();
});
