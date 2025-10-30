module.exports = {
  ...require('@backstage/cli/config/eslint-factory')(__dirname),
  rules: {
    // Allow console statements for debugging execution plan issues
    'no-console': 'off',
    // Allow conditional expects in tests for complex logic
    'jest/no-conditional-expect': 'off',
    // Allow existing React hooks patterns
    'react-hooks/exhaustive-deps': 'warn',
    // Allow span and p elements for styling purposes
    'react/forbid-elements': 'warn',
  },
};
