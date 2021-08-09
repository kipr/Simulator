/* eslint-env node */

module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
  ],
  env: {
    es6: true,
  },
  rules: {
    // Project-specific ESLint rules
    'array-bracket-spacing': 'error',
    'arrow-spacing': 'error',
    'brace-style': 'error',
    'comma-style': 'error',
    'eqeqeq': 'error',
    'indent': ['error', 2, { 'SwitchCase': 1 }],
    'keyword-spacing': 'error',
    'newline-per-chained-call': 'error',
    'no-confusing-arrow': 'error',
    'no-duplicate-imports': 'error',
    'no-else-return': 'error',
    'no-new-wrappers': 'error',
    'no-param-reassign': 'error',
    'no-useless-constructor': 'error',
    'no-whitespace-before-property': 'error',
    'nonblock-statement-body-position': 'error',
    'object-curly-spacing': ['error', 'always'],
    'operator-linebreak': 'error',
    'prefer-arrow-callback': 'error',
    'prefer-const': 'error',
    'prefer-template': 'error',
    'semi': 'error',
    'space-before-blocks': 'error',
    'space-before-function-paren': ['error', { 'named': 'never' }],
    'space-in-parens': 'error',
    'space-infix-ops': 'error',
    'spaced-comment': 'error',
    'template-curly-spacing': 'error',
  },
  overrides: [
    {
      // Specific override for TypeScript files
      files: ['**/*.ts', '**/*.tsx'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: ['./tsconfig.json'],
      },
      plugins: [
        '@typescript-eslint',
      ],
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
      ],
      rules: {
        // TypeScript extension rules that conflict with normal ESLint rules
        'brace-style': 'off',
        '@typescript-eslint/brace-style': 'error',
        'indent': 'off',
        '@typescript-eslint/indent': ['error', 2, { 'SwitchCase': 1 }],
        'keyword-spacing': 'off',
        '@typescript-eslint/keyword-spacing': 'error',
        'no-duplicate-imports': 'off',
        '@typescript-eslint/no-duplicate-imports': 'error',
        'no-useless-constructor': 'off',
        '@typescript-eslint/no-useless-constructor': 'off',
        'object-curly-spacing': 'off',
        '@typescript-eslint/object-curly-spacing': ['error', 'always'],
        'semi': 'off',
        '@typescript-eslint/semi': 'error',
        'space-before-function-paren': 'off',
        '@typescript-eslint/space-before-function-paren': ['error', { 'named': 'never' }],
        'space-infix-ops': 'off',
        '@typescript-eslint/space-infix-ops': 'error',

        // Project-specific ESLint rules for TypeScript
        // Allow namespaces for now, since the project relies on several namespaces
        '@typescript-eslint/no-namespace': 'off',
        '@typescript-eslint/type-annotation-spacing': 'error',
        '@typescript-eslint/prefer-for-of': 'error',
        '@typescript-eslint/no-empty-interface': 'off',
        '@typescript-eslint/explicit-module-boundary-types' : 'off',
        '@typescript-eslint/no-floating-promises': ['error', { ignoreIIFE: true }],
        '@typescript-eslint/no-unused-vars': ['off'],
      },
    },
  ],
  ignorePatterns: [
    // Ignore build output
    "dist",
    // Ignore webpack config files
    "/configs",
    // Ignore included ammo.js library
    "/src/ammo.js",
    // Ignore static files
    "/static",
    // Ignore libwallaby
    "/libwallaby",
  ],
};