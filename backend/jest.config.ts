/** @type {import('jest').Config} */
import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  moduleNameMapper: {
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@middleware/(.*)$': '<rootDir>/src/middleware/$1',
    '^@features/(.*)$': '<rootDir>/src/features/$1',
    '^@db/(.*)$': '<rootDir>/src/db/$1',
    '^expo-server-sdk$': '<rootDir>/tests/__mocks__/expo-server-sdk.ts',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/server.ts',
    '!src/**/*.types.ts',
    '!src/**/*.d.ts',
  ],
  coverageThreshold: {
    global: {
      // Thresholds per AGENT_RULES.md §22.4 — must not be lowered without an ADR
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80,
    },
  },
  coverageReporters: ['text', 'lcov', 'clover'],
  // Must use setupFiles (not setupFilesAfterFramework) so env vars are set
  // before any test module's top-level imports run (env.ts validates at load time).
  setupFiles: ['<rootDir>/jest.setup.ts'],
  clearMocks: true,
  restoreMocks: true,
};

export default config;
