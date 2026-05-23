const { defineConfig } = require('vitest/config');

module.exports = defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./test.setup.js'],
    include: ['../Testing/unit/**/*.test.js'],
    clearMocks: true,
    restoreMocks: true,
    mockReset: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      reportsDirectory: '../Testing/unit/coverage',
      include: ['src/**/*.js'],
      exclude: ['src/index.js', 'src/seed.js', 'src/config/swagger.js'],
      thresholds: {
        statements: 85,
        branches: 80,
        functions: 85,
        lines: 85,
      },
    },
  },
});
