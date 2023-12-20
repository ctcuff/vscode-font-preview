const baseConfig = require('@font-preview/eslint-base-config/')

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
  ignorePatterns: [...baseConfig.ignorePatterns, 'index.js'],
  overrides: [...baseConfig.overrides]
}
