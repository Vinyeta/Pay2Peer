module.exports = {
  root: true,
  extends: ['next/core-web-vitals'],
  ignorePatterns: ['.next/', 'node_modules/', 'dist/'],
  rules: {
    'no-unused-vars': 'warn',
    '@typescript-eslint/no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }],
  },
}
