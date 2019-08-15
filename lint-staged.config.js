module.exports = {
  "*.{ts}": ["eslint --fix", "git add"],
  "*.{js,json,yml,yaml,md,graphql}": ["prettier --write", "git add"],
};
