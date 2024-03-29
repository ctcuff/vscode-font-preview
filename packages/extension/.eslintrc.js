const baseConfig = require('@font-preview/eslint-base-config')

/**
 * @type {import('eslint').Linter.Config}
 */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module'
  },
  plugins: ['@typescript-eslint'],
  rules: {
    ...baseConfig.rules
  },
  ignorePatterns: ['out', 'dist', '**/*.d.ts', 'web-dist', 'web/**/*'],
  overrides: [...baseConfig.overrides]
}
