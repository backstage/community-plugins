const backstageEslintConfig = require('@backstage/cli/config/eslint-factory')(
  __dirname,
);

module.exports = {
  ...backstageEslintConfig,
  ignorePatterns: [
    ...backstageEslintConfig.ignorePatterns,
    'static/generated/**',
  ],
};
