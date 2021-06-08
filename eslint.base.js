// Shared eslint config used in the extension and the webview
module.exports = {
  ignorePatterns: ['.eslintrc.js', 'webpack.config.js'],
  rules: {
    'arrow-parens': ['error', 'as-needed'],
    'arrow-body-style': 'off',
    semi: ['error', 'never'],
    'semi-style': 'off',
    'no-console': 'error',
    'comma-dangle': ['error', 'never'],
    'operator-linebreak': 'off',
    'class-methods-use-this': 'off',
    'implicit-arrow-linebreak': 'off',
    'object-curly-newline': 'off',
    'no-plusplus': 'off',
    'func-names': 'off',
    'no-param-reassign': ['error', { props: false }],
    'lines-between-class-members': 'off',
    // Disabled to let TypeScript handle unused variable checking.
    //  ESLint would report unused variables in a type's
    // function callback declaration
    'no-unused-vars': 'off',
    // Disabled to allow types to be defined at the end of a file
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': ['error'],
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { args: 'after-used' }]
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        '@typescript-eslint/explicit-module-boundary-types': ['error']
      }
    }
  ]
}
