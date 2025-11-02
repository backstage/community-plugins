# @backstage-community/plugin-analytics-module-ga4

## 0.12.0

### Minor Changes

- 1e3b40b: Backstage version bump to v1.44.0

## 0.11.0

### Minor Changes

- 2258b1a: Backstage version bump to v1.43.2

### Patch Changes

- 409370a: Added support for Backstage's New Frontend System.

  If you're migrating to the new frontend system, you no longer need to wire up an API implementation in `apis.ts`. Instead, pass the module in to the `createApp()` function:

  ```tsx
  import ga4Module from '@backstage-community/plugin-analytics-module-ga4/alpha';

  const app = createApp({
    features: [ga4Module],
  });
  ```

  This can be skipped if you have feature discovery enabled.

## 0.10.0

### Minor Changes

- 3d6351f: Backstage version bump to v1.42.4

## 0.9.0

### Minor Changes

- 70f97c5: Backstage version bump to v1.40.2

## 0.8.0

### Minor Changes

- 4ed9028: Backstage version bump to v1.39.0

## 0.7.0

### Minor Changes

- 8b665f9: Backstage version bump to v1.38.1

## 0.6.1

### Patch Changes

- 4aad9f3: remove unused devDependency `canvas`

## 0.6.0

### Minor Changes

- 9fe29e9: Backstage version bump to v1.37.0

## 0.5.0

### Minor Changes

- 926f672: Backstage version bump to v1.36.1

## 0.4.0

### Minor Changes

- b56df3f: Backstage version bump to v1.35.1

## 0.3.0

### Minor Changes

- cab1716: Allow defining custom cookie flags and setting it to 'SameSite=Lax' by default to make every browser behave similarly.
- ac6e8f9: Backstage version bump to v1.34.1

## 0.2.11

### Patch Changes

- 46ca1d0: Backstage version bump to v1.32.2

## 0.2.10

### Patch Changes

- 6de81a5: Backstage version bump to v1.31.2

## 0.2.9

### Patch Changes

- 6811b41: Backstage version bump to v1.30.2

## 0.2.8

### Patch Changes

- fa9e4f4: version:bump to v1.29.1

## 0.2.7

### Patch Changes

- 347a5eb: Filter out custom dimenstion keys with empty string values

## 0.2.6

### Patch Changes

- ef2028c: Allow custom dimension context and attributes with falsy values

## 0.2.5

### Patch Changes

- 193a2a3: Migrated from the [backstage/backstage](https://github.com/backstage/backstage) monorepo.

## 0.2.4

### Patch Changes

- abfbcfc: Updated dependency `@testing-library/react` to `^15.0.0`.
- cb1e3b0: Updated dependency `@testing-library/dom` to `^10.0.0`.
- Updated dependencies
  - @backstage/core-components@0.14.4
  - @backstage/core-plugin-api@1.9.2
  - @backstage/frontend-plugin-api@0.6.4
  - @backstage/config@1.2.0

## 0.2.4-next.1

### Patch Changes

- Updated dependencies
  - @backstage/frontend-plugin-api@0.6.4-next.1
  - @backstage/config@1.2.0
  - @backstage/core-components@0.14.4-next.0
  - @backstage/core-plugin-api@1.9.1

## 0.2.4-next.0

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.14.4-next.0
  - @backstage/config@1.2.0
  - @backstage/core-plugin-api@1.9.1
  - @backstage/frontend-plugin-api@0.6.4-next.0

## 0.2.3

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.14.3
  - @backstage/frontend-plugin-api@0.6.3
  - @backstage/core-plugin-api@1.9.1
  - @backstage/config@1.2.0

## 0.2.2

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.14.2
  - @backstage/frontend-plugin-api@0.6.2
  - @backstage/core-plugin-api@1.9.1
  - @backstage/config@1.2.0

## 0.2.1

### Patch Changes

- Updated dependencies
  - @backstage/config@1.2.0
  - @backstage/core-components@0.14.1
  - @backstage/core-plugin-api@1.9.1
  - @backstage/frontend-plugin-api@0.6.1

## 0.2.1-next.2

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.14.1-next.2
  - @backstage/frontend-plugin-api@0.6.1-next.2
  - @backstage/config@1.2.0-next.1
  - @backstage/core-plugin-api@1.9.1-next.1

## 0.2.1-next.1

### Patch Changes

- Updated dependencies
  - @backstage/config@1.2.0-next.1
  - @backstage/core-components@0.14.1-next.1
  - @backstage/core-plugin-api@1.9.1-next.1
  - @backstage/frontend-plugin-api@0.6.1-next.1

## 0.2.1-next.0

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.14.1-next.0
  - @backstage/config@1.1.2-next.0
  - @backstage/core-plugin-api@1.9.1-next.0
  - @backstage/frontend-plugin-api@0.6.1-next.0

## 0.2.0

### Minor Changes

- e586f79: Add support to the new analytics api.

### Patch Changes

- 9aac2b0: Use `--cwd` as the first `yarn` argument
- 8472188: Added or fixed the `repository` field in `package.json`.
- Updated dependencies
  - @backstage/frontend-plugin-api@0.6.0
  - @backstage/core-components@0.14.0
  - @backstage/core-plugin-api@1.9.0
  - @backstage/config@1.1.1

## 0.2.0-next.2

### Patch Changes

- 8472188: Added or fixed the `repository` field in `package.json`.
- Updated dependencies
  - @backstage/core-components@0.14.0-next.2
  - @backstage/config@1.1.1
  - @backstage/core-plugin-api@1.9.0-next.1
  - @backstage/frontend-plugin-api@0.6.0-next.3

## 0.2.0-next.1

### Patch Changes

- 9aac2b0: Use `--cwd` as the first `yarn` argument
- Updated dependencies
  - @backstage/core-components@0.14.0-next.1
  - @backstage/core-plugin-api@1.9.0-next.1
  - @backstage/frontend-plugin-api@0.6.0-next.2
  - @backstage/config@1.1.1

## 0.2.0-next.0

### Minor Changes

- e586f79: Add support to the new analytics api.

### Patch Changes

- Updated dependencies
  - @backstage/frontend-plugin-api@0.6.0-next.1
  - @backstage/core-components@0.14.0-next.0
  - @backstage/core-plugin-api@1.8.3-next.0
  - @backstage/config@1.1.1

## 0.1.8

### Patch Changes

- 4016f21: Remove some unused dependencies
- Updated dependencies
  - @backstage/core-components@0.13.10
  - @backstage/core-plugin-api@1.8.2
  - @backstage/config@1.1.1

## 0.1.8-next.1

### Patch Changes

- Updated dependencies
  - @backstage/core-plugin-api@1.8.2-next.0
  - @backstage/core-components@0.13.10-next.1
  - @backstage/config@1.1.1

## 0.1.8-next.0

### Patch Changes

- 4016f21: Remove some unused dependencies
- Updated dependencies
  - @backstage/core-components@0.13.10-next.0
  - @backstage/config@1.1.1
  - @backstage/core-plugin-api@1.8.1

## 0.1.7

### Patch Changes

- af6f227: Disabled `send_page_view` to get rid of events duplication
- Updated dependencies
  - @backstage/core-plugin-api@1.8.1
  - @backstage/core-components@0.13.9
  - @backstage/theme@0.5.0
  - @backstage/config@1.1.1

## 0.1.7-next.3

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.13.9-next.3
  - @backstage/config@1.1.1
  - @backstage/core-plugin-api@1.8.1-next.1
  - @backstage/theme@0.5.0-next.1

## 0.1.7-next.2

### Patch Changes

- Updated dependencies
  - @backstage/theme@0.5.0-next.1
  - @backstage/config@1.1.1
  - @backstage/core-components@0.13.9-next.2
  - @backstage/core-plugin-api@1.8.1-next.1

## 0.1.7-next.1

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.13.9-next.1
  - @backstage/core-plugin-api@1.8.1-next.1
  - @backstage/config@1.1.1
  - @backstage/theme@0.5.0-next.0

## 0.1.7-next.0

### Patch Changes

- Updated dependencies
  - @backstage/core-plugin-api@1.8.1-next.0
  - @backstage/core-components@0.13.9-next.0
  - @backstage/theme@0.5.0-next.0
  - @backstage/config@1.1.1

## 0.1.6

### Patch Changes

- 6c2b872153: Add official support for React 18.
- 504614d313: Updated dependency `@types/jest` to `^29.0.0`.
- Updated dependencies
  - @backstage/core-components@0.13.8
  - @backstage/core-plugin-api@1.8.0
  - @backstage/theme@0.4.4
  - @backstage/config@1.1.1

## 0.1.6-next.2

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.13.8-next.2

## 0.1.6-next.1

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.13.8-next.1
  - @backstage/config@1.1.1
  - @backstage/core-plugin-api@1.8.0-next.0
  - @backstage/theme@0.4.4-next.0

## 0.1.6-next.0

### Patch Changes

- 6c2b872153: Add official support for React 18.
- Updated dependencies
  - @backstage/core-components@0.13.7-next.0
  - @backstage/core-plugin-api@1.8.0-next.0
  - @backstage/theme@0.4.4-next.0
  - @backstage/config@1.1.1

## 0.1.5

### Patch Changes

- 9a1fce352e: Updated dependency `@testing-library/jest-dom` to `^6.0.0`.
- f95af4e540: Updated dependency `@testing-library/dom` to `^9.0.0`.
- Updated dependencies
  - @backstage/core-plugin-api@1.7.0
  - @backstage/core-components@0.13.6
  - @backstage/theme@0.4.3
  - @backstage/config@1.1.1

## 0.1.5-next.2

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.13.6-next.2
  - @backstage/core-plugin-api@1.7.0-next.1
  - @backstage/theme@0.4.3-next.0
  - @backstage/config@1.1.1-next.0

## 0.1.5-next.1

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.13.6-next.1
  - @backstage/core-plugin-api@1.7.0-next.0
  - @backstage/config@1.1.0
  - @backstage/theme@0.4.2

## 0.1.5-next.0

### Patch Changes

- Updated dependencies
  - @backstage/core-plugin-api@1.7.0-next.0
  - @backstage/core-components@0.13.6-next.0
  - @backstage/config@1.1.0
  - @backstage/theme@0.4.2

## 0.1.4

### Patch Changes

- 406b786a2a2c: Mark package as being free of side effects, allowing more optimized Webpack builds.
- 8cec7664e146: Removed `@types/node` dependency
- Updated dependencies
  - @backstage/core-components@0.13.5
  - @backstage/config@1.1.0
  - @backstage/core-plugin-api@1.6.0
  - @backstage/theme@0.4.2

## 0.1.4-next.3

### Patch Changes

- 406b786a2a2c: Mark package as being free of side effects, allowing more optimized Webpack builds.
- Updated dependencies
  - @backstage/config@1.1.0-next.2
  - @backstage/core-components@0.13.5-next.3
  - @backstage/core-plugin-api@1.6.0-next.3
  - @backstage/theme@0.4.2-next.0

## 0.1.4-next.2

### Patch Changes

- 8cec7664e146: Removed `@types/node` dependency
- Updated dependencies
  - @backstage/core-components@0.13.5-next.2
  - @backstage/core-plugin-api@1.6.0-next.2
  - @backstage/config@1.1.0-next.1
  - @backstage/theme@0.4.1

## 0.1.4-next.1

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.13.5-next.1
  - @backstage/config@1.1.0-next.0
  - @backstage/core-plugin-api@1.6.0-next.1
  - @backstage/theme@0.4.1

## 0.1.4-next.0

### Patch Changes

- Updated dependencies
  - @backstage/core-plugin-api@1.6.0-next.0
  - @backstage/core-components@0.13.5-next.0
  - @backstage/config@1.0.8
  - @backstage/theme@0.4.1

## 0.1.3

### Patch Changes

- 12a8c94eda8d: Add package repository and homepage metadata
- Updated dependencies
  - @backstage/core-components@0.13.4
  - @backstage/core-plugin-api@1.5.3
  - @backstage/config@1.0.8
  - @backstage/theme@0.4.1

## 0.1.3-next.1

### Patch Changes

- 12a8c94eda8d: Add package repository and homepage metadata
- Updated dependencies
  - @backstage/config@1.0.8
  - @backstage/core-components@0.13.4-next.0
  - @backstage/core-plugin-api@1.5.3
  - @backstage/theme@0.4.1

## 0.1.3-next.0

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.13.4-next.0
  - @backstage/core-plugin-api@1.5.3
  - @backstage/config@1.0.8
  - @backstage/theme@0.4.1

## 0.1.2

### Patch Changes

- Updated dependencies
  - @backstage/theme@0.4.1
  - @backstage/core-components@0.13.3
  - @backstage/core-plugin-api@1.5.3
  - @backstage/config@1.0.8

## 0.1.2-next.2

### Patch Changes

- Updated dependencies
  - @backstage/theme@0.4.1-next.1
  - @backstage/core-plugin-api@1.5.3-next.1
  - @backstage/core-components@0.13.3-next.2
  - @backstage/config@1.0.8

## 0.1.2-next.1

### Patch Changes

- Updated dependencies
  - @backstage/theme@0.4.1-next.0
  - @backstage/core-components@0.13.3-next.1
  - @backstage/core-plugin-api@1.5.3-next.0
  - @backstage/config@1.0.8

## 0.1.2-next.0

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.13.3-next.0
  - @backstage/config@1.0.8
  - @backstage/core-plugin-api@1.5.2
  - @backstage/theme@0.4.0

## 0.1.1

### Patch Changes

- 99056db6169e: Fixed configuration visibility settings for `allowedContexts` and `allowedAttributes`
- 3d11596a72b5: Update plugin installation docs to be more consistent across documentations
- Updated dependencies
  - @backstage/core-plugin-api@1.5.2
  - @backstage/core-components@0.13.2
  - @backstage/theme@0.4.0
  - @backstage/config@1.0.8

## 0.1.1-next.3

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.13.2-next.3
  - @backstage/config@1.0.7
  - @backstage/core-plugin-api@1.5.2-next.0
  - @backstage/theme@0.4.0-next.1

## 0.1.1-next.2

### Patch Changes

- Updated dependencies
  - @backstage/theme@0.4.0-next.1
  - @backstage/core-components@0.13.2-next.2
  - @backstage/config@1.0.7
  - @backstage/core-plugin-api@1.5.2-next.0

## 0.1.1-next.1

### Patch Changes

- 99056db6169e: Fixed configuration visibility settings for `allowedContexts` and `allowedAttributes`
- Updated dependencies
  - @backstage/core-components@0.13.2-next.1
  - @backstage/core-plugin-api@1.5.2-next.0
  - @backstage/config@1.0.7
  - @backstage/theme@0.4.0-next.0

## 0.1.1-next.0

### Patch Changes

- 3d11596a72b5: Update plugin installation docs to be more consistent across documentations
- Updated dependencies
  - @backstage/theme@0.4.0-next.0
  - @backstage/config@1.0.7
  - @backstage/core-components@0.13.2-next.0
  - @backstage/core-plugin-api@1.5.1

## 0.1.0

### Minor Changes

- 22b46f7f562: Plugin provides Backstage Analytics API for Google Analytics 4. Once installed and configured, analytics events will be sent to GA4 as your users navigate and use your Backstage instance

### Patch Changes

- Updated dependencies
  - @backstage/theme@0.3.0
  - @backstage/core-components@0.13.1
  - @backstage/config@1.0.7
  - @backstage/core-plugin-api@1.5.1

## 0.1.0-next.2

### Patch Changes

- Updated dependencies
  - @backstage/theme@0.3.0-next.0
  - @backstage/core-components@0.13.1-next.1
  - @backstage/config@1.0.7
  - @backstage/core-plugin-api@1.5.1

## 0.1.0-next.1

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.13.1-next.0
  - @backstage/core-plugin-api@1.5.1
  - @backstage/config@1.0.7

## 0.1.0-next.0

### Minor Changes

- 22b46f7f562: Plugin provides Backstage Analytics API for Google Analytics 4. Once installed and configured, analytics events will be sent to GA4 as your users navigate and use your Backstage instance

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.13.0
  - @backstage/core-plugin-api@1.5.1
  - @backstage/config@1.0.7
  - @backstage/theme@0.2.19
