/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ['next/core-web-vitals', 'next/typescript'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    'react/no-unescaped-entities': 'off',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': 'error'
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json'
  }
};
