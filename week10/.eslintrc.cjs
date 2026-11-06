module.exports = {
  root: true,
  env: { browser: true, es2022: true, node: true },
  parser: "@typescript-eslint/parser",
  parserOptions: { ecmaVersion: "latest", sourceType: "module" },
  plugins: ["@typescript-eslint"],
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "prettier"],
  overrides: [{ files: ["**/*.ts"] }],
  ignorePatterns: ["node_modules/", "dist/"],
  rules: {
    complexity: ["error", 10],
    "max-depth": ["error", 3],
    "@typescript-eslint/no-explicit-any": "error",
  },
};
