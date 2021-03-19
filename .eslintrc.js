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