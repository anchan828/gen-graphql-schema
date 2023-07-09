module.exports = {
  "*.{ts}": ["eslint --fix", "prettier --write", "git add"],
  "*.{js,json,yml,yaml,md,graphql}": ["prettier --write", "git add"],
};
