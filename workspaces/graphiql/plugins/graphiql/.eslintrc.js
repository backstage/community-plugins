module.exports = require('@backstage/cli/config/eslint-factory')(__dirname, {
  rules: {
    'jest/expect-expect': 0,
    '@backstage/no-top-level-material-ui-4-imports': 'error',
  },
});
