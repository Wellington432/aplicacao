const transform = {
  '^.+\\.tsx?$': [
    'ts-jest',
    {
      tsconfig: {
        module: 'CommonJS',
        rootDir: '.',
        types: ['node', 'jest'],
        esModuleInterop: true,
      },
    },
  ],
};

module.exports = {
  projects: [
    {
      displayName: 'unit',
      preset: 'ts-jest',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/tests/unit/**/*.unit.test.ts'],
      setupFilesAfterEnv: ['<rootDir>/tests/setup/unit.setup.ts'],
      testTimeout: 10000,
      transform,
    },
    {
      displayName: 'integration',
      preset: 'ts-jest',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/tests/integration/**/*.integration.test.ts'],
      setupFiles: ['<rootDir>/tests/setup/load-test-env.ts'],
      setupFilesAfterEnv: ['<rootDir>/tests/setup/integration.setup.ts'],
      testTimeout: 30000,
      transform,
    },
  ],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/@types/**',
    '!src/types/**',
    '!src/prisma/**',
    '!src/server.ts',
  ],
  maxWorkers: 1,
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
