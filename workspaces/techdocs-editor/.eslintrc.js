module.exports = require('@backstage/cli/config/eslint-factory').createConfig(
  __dirname,
  {
    ignorePatterns: ['**/dist/**', '**/dist-types/**'],
  },
);
