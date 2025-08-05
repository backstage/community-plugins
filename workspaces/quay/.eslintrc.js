const defaultRules = require('../../.eslintrc.cjs');
module.exports = {
  ...defaultRules,
  overrides: defaultRules.overrides.map((override) => {
    return {
      ...override,
      rules: {
        ...override.rules,
        // We disable the rule that forbids certain elements
        // because this plugin is based on PatternFly instead of MUI
        // and uses span elements in different places.
        'react/forbid-elements': ['off'],
      },
    };
  }),
}
