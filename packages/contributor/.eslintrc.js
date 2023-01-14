module.exports = {
  plugins: ["jest", "@typescript-eslint/eslint-plugin"],
  extends: [
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    sourceType: "module",
  },
  rules: {
    "no-unused-vars": "off",
    "i18n-text/no-en": "off",
  },
  env: {
    node: true,
    jest: true,
  },
};
