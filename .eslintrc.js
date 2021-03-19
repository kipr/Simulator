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
        'prefer-template': 'error',
        'template-curly-spacing': 'error',
        'space-before-function-paren': ['error', {
            'named': 'never',
        }],
        'space-before-blocks': 'error',
        'keyword-spacing': 'error',
        'no-param-reassign': 'error',
        'prefer-arrow-callback': 'error',
        'arrow-spacing': 'error',
        'no-confusing-arrow': 'error',
        'no-useless-constructor': 'error',
        'no-duplicate-imports': 'error',
        'prefer-const': 'error',
        'operator-linebreak': 'error',
        'eqeqeq': 'error',
        'nonblock-statement-body-position': 'error',
        'brace-style': 'error',
        'no-else-return': 'error',
        'spaced-comment': 'error',
        'space-infix-ops': 'error',
        'newline-per-chained-call': 'error',
        'no-whitespace-before-property': 'error',
        'space-in-parens': 'error',
        'array-bracket-spacing': 'error',
        'object-curly-spacing': ['error', 'always'],
        'comma-style': 'error',
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