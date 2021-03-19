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
        'array-bracket-spacing': 'error',
        'arrow-spacing': 'error',
        'brace-style': 'error',
        'comma-style': 'error',
        'eqeqeq': 'error',
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
                // Allow namespaces for now, since the project relies on several namespaces
                '@typescript-eslint/no-namespace': 'off',
                '@typescript-eslint/type-annotation-spacing': 'error',
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
    ],
};