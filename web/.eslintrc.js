const baseConfig = require('../eslint.base')

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
  ignorePatterns: baseConfig.ignorePatterns,
  rules: {
    ...baseConfig.rules,
    'no-alert': 'error',
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
    {
      files: ['*.d.ts'],
      globals: {
        React: true
      }
    }
  ]
}
