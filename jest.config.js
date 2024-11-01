module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./src/tests/setupTests.js'],
  testMatch: ['**/tests/**/*.js', '**/*.test.js'],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  testTimeout: 10000,
  coveragePathIgnorePatterns: [
    '/node_modules/'
  ],
  moduleFileExtensions: ['js', 'json'],
  roots: ['<rootDir>']
};
