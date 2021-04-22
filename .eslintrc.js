module.exports = {
    root: true,
    env: {
        browser: true,
        node: true
    },
    parserOptions: {
        ecmaVersion: 2020
    },
    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint", "prettier"],
    extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "prettier"],
    rules: {
        "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
        "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
        "object-curly-spacing": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-empty-function": "off",
        "prettier/prettier": [
            "error",
            {
                arrowParens: "always",
                bracketSpacing: true,
                embeddedLanguageFormatting: "auto",
                htmlWhitespaceSensitivity: "css",
                insertPragma: false,
                printWidth: 300,
                proseWrap: "preserve",
                quoteProps: "as-needed",
                requirePragma: false,
                semi: true,
                singleQuote: false,
                tabWidth: 4,
                trailingComma: "none",
                useTabs: false,
                vueIndentScriptAndStyle: true,
                endOfLine: "auto"
            }
        ]
    }
};
