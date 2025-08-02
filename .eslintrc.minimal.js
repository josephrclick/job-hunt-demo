module.exports = {
  extends: ["next/core-web-vitals"],
  parser: "@typescript-eslint/parser",
  rules: {
    // Allow unused variables/parameters prefixed with underscore
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        "args": "after-used",
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_"
      }
    ]
  },
};
