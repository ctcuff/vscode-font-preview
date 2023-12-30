const baseConfig = require('@font-preview/eslint-base-config')

/**
 * @type {import('eslint').Linter.Config}
 */
module.exports = {
  root: true,
  extends: [
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'airbnb',
    'airbnb/hooks'
  ],
  globals: {
    JSX: true
  },
  env: {
    browser: true,
    node: true,
    es2021: true,
    jest: true
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    sourceType: 'module'
  },
  settings: {
    react: {
      version: 'detect'
    },
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.d.ts']
      }
    }
  },
  ignorePatterns: [...baseConfig.ignorePatterns],
  rules: {
    ...baseConfig.rules,
    'no-param-reassign': 'off',
    'no-alert': 'error',
    'no-shadow': 'off',
    'no-confusing-arrow': 'off', // Off because it conflicts with prettier
    indent: 'off', // Off because it conflicts with prettier
    'function-paren-newline': 'off', // Off because it conflicts with prettier
    'import/extensions': ['error', 'never'],
    'react-hooks/exhaustive-deps': 'off',
    'react/no-array-index-key': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react/destructuring-assignment': 'off',
    'react/jsx-one-expression-per-line': 'off',
    'react/jsx-curly-newline': 'off',
    'react/jsx-filename-extension': ['error', { extensions: ['.jsx', '.tsx'] }],
    'react/jsx-curly-spacing': [
      'error',
      {
        when: 'never',
        children: {
          when: 'never'
        }
      }
    ],
    'react/jsx-wrap-multilines': ['error', { prop: 'ignore' }],
    'jsx-a11y/media-has-caption': 'off',
    'jsx-a11y/click-events-have-key-events': 'off',
    'jsx-a11y/no-noninteractive-element-interactions': 'off',
    'jsx-a11y/no-static-element-interactions': 'off',
    'react/prop-types': 'off',
    'react/static-property-placement': 'off',
    'react/require-default-props': [
      'error',
      {
        ignoreFunctionalComponents: true
      }
    ]
  },
  overrides: [
    ...baseConfig.overrides,
    {
      files: ['*.d.ts'],
      globals: {
        React: true
      }
    }
  ]
}
