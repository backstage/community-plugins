module.exports = {
  ...require('../../.eslintrc.cjs'),
  overrides: [
    // TODO: Remove this override once the following issue is resolved
    {
      files: ['*.tsx', '*.ts'],
      rules: {
        'react/forbid-elements': 'off',
      },
    },
  ],
};
