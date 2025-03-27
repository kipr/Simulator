import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [{
    ignores: ["**/dist", "configs", "static", "dependencies", "test", "i18n"],
}, ...compat.extends("eslint:recommended"), {
    languageOptions: {
        globals: {},
    },

    rules: {
        "array-bracket-spacing": "error",
        "arrow-spacing": "error",

        "brace-style": ["error", "1tbs", {
            allowSingleLine: true,
        }],

        "comma-style": "error",
        eqeqeq: "error",

        indent: ["error", 2, {
            SwitchCase: 1,
        }],

        "keyword-spacing": "error",
        "newline-per-chained-call": "error",
        "no-confusing-arrow": "error",
        "no-duplicate-imports": "error",
        "no-else-return": "error",
        "no-new-wrappers": "error",
        "no-param-reassign": "error",
        "no-useless-constructor": "error",
        "no-whitespace-before-property": "error",
        "nonblock-statement-body-position": "error",
        "object-curly-spacing": ["error", "always"],
        "operator-linebreak": "error",
        "prefer-arrow-callback": "error",
        "prefer-const": "error",
        "prefer-template": "error",
        semi: "error",
        "space-before-blocks": "error",

        "space-before-function-paren": ["error", {
            named: "never",
        }],

        "space-in-parens": "error",
        "space-infix-ops": "error",
        "spaced-comment": "error",
        "template-curly-spacing": "error",
    },
}, ...compat.extends(
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
).map(config => ({
    ...config,
    files: ["**/*.ts", "**/*.tsx"],
})), {
    files: ["**/*.ts", "**/*.tsx"],

    plugins: {
        "@typescript-eslint": typescriptEslint,
    },

    languageOptions: {
        parser: tsParser,
        ecmaVersion: 5,
        sourceType: "script",

        parserOptions: {
            tsconfigRootDir: "/home/tom/kipr_sources/Simulator",
            project: ["./tsconfig.json"],
        },
    },

    rules: {
        "brace-style": "off",

        "@typescript-eslint/brace-style": ["error", "1tbs", {
            allowSingleLine: true,
        }],

        indent: "off",

        "@typescript-eslint/indent": ["error", 2, {
            SwitchCase: 1,
        }],

        "keyword-spacing": "off",
        "@typescript-eslint/keyword-spacing": "error",
        "no-duplicate-imports": "off",
        "@typescript-eslint/no-duplicate-imports": "error",
        "no-useless-constructor": "off",
        "@typescript-eslint/no-useless-constructor": "off",
        "object-curly-spacing": "off",
        "@typescript-eslint/object-curly-spacing": ["error", "always"],
        semi: "off",
        "@typescript-eslint/semi": "error",
        "space-before-function-paren": "off",

        "@typescript-eslint/space-before-function-paren": ["error", {
            named: "never",
        }],

        "space-infix-ops": "off",
        "@typescript-eslint/space-infix-ops": "error",
        "@typescript-eslint/no-namespace": "off",
        "@typescript-eslint/type-annotation-spacing": "error",
        "@typescript-eslint/prefer-for-of": "error",
        "@typescript-eslint/no-empty-interface": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",

        "@typescript-eslint/no-floating-promises": ["error", {
            ignoreIIFE: true,
        }],

        "@typescript-eslint/no-unused-vars": ["off"],
    },
}];
