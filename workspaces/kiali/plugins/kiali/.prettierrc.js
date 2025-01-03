// @ts-check

/** @type {import("@ianvs/prettier-plugin-sort-imports").PrettierConfig} */
module.exports = {
  ...require('@spotify/prettier-config'),
  plugins: ['@ianvs/prettier-plugin-sort-imports'],
  importOrder: [
    '^react(.*)$',
    '',
    '^@backstage/(.*)$',
    '',
    '<THIRD_PARTY_MODULES>',
    '',
    '^@backstage-community/(.*)$',
    '',
    '<BUILTIN_MODULES>',
    '',
    '^[.]',
  ],
};
