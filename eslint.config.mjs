import nx from "@nx/eslint-plugin";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import parser from "jsonc-eslint-parser";
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
    ignores: ["**/playwright.config.ts"],
}, ...compat.extends("eslint:recommended", "./.eslintrc.base.js"), {
    plugins: {
        "@nx": nx,
    },

    languageOptions: {
        globals: {
            ...globals.node,
        },

        parser: tsParser,
    },

    rules: {
        "@typescript-eslint/explicit-module-boundary-types": ["error"],
    },
}, {
    files: ["**/*.json"],

    languageOptions: {
        parser: parser,
    },

    rules: {},
}, {
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],

    rules: {
        "@nx/enforce-module-boundaries": ["error", {
            enforceBuildableLibDependency: true,
            allow: [],

            depConstraints: [{
                sourceTag: "*",
                onlyDependOnLibsWithTags: ["*"],
            }],
        }],
    },
}];