module.exports = {
  extends: [require.resolve('@backstage/cli/config/eslint.backend')],
  rules: {
    'notice/notice': 'off',
  },
};
