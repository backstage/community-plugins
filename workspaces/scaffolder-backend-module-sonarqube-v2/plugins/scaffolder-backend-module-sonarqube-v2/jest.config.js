// @ts-check
/** @type {import('@jest/types').Config.InitialOptions} */

export default {
  preset: '@backstage/cli/config/jest',
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        isolatedModules: true,
      },
    ],
  },
};
