# @backstage-community/plugin-github-issues

## 0.11.0

### Minor Changes

- 4b540a8: Backstage version bump to v1.40.2

## 0.10.0

### Minor Changes

- 8035eee: Backstage version bump to v1.39.0

## 0.9.0

### Minor Changes

- c1cc759: Backstage version bump to v1.38.1

## 0.8.1

### Patch Changes

- 4aad9f3: remove unused devDependency `canvas`

## 0.8.0

### Minor Changes

- 1484b29: Backstage version bump to v1.37.0

## 0.7.0

### Minor Changes

- cb85eea: Backstage version bump to v1.36.1

## 0.6.0

### Minor Changes

- ed58d1c: Backstage version bump to v1.35.1

## 0.5.0

### Minor Changes

- 4e8bc98: Backstage version bump to v1.34.1

## 0.4.8

### Patch Changes

- 596f613: Adding support for the new frontend system, available at the `/alpha` export.

## 0.4.7

### Patch Changes

- b2bf4d5: Backstage version bump to v1.32.2

## 0.4.6

### Patch Changes

- 0434fea: Backstage version bump to v1.31.2

## 0.4.5

### Patch Changes

- db0dc8d: Introduces support for multiple GitHub integrations. The previous behavior of using the first GitHub provider has been changed to use the well-known entity slug annotation `backstage.io/source-location` or `backstage.io/managed-by-location` to determine the appropriate provider. If no provider matches the slug, the first GitHub provider will be selected, maintaining the previous behavior.

## 0.4.4

### Patch Changes

- a71c87e: Backstage version bump to v1.30.2

## 0.4.3

### Patch Changes

- 3bad3d2: version:bump to v1.29.1

## 0.4.2

### Patch Changes

- 193a2a3: Migrated from the [backstage/backstage](https://github.com/backstage/backstage) monorepo.

## 0.4.1

### Patch Changes

- abfbcfc: Updated dependency `@testing-library/react` to `^15.0.0`.
- cb1e3b0: Updated dependency `@testing-library/dom` to `^10.0.0`.
- Updated dependencies
  - @backstage/plugin-catalog-react@1.11.3
  - @backstage/core-components@0.14.4
  - @backstage/core-plugin-api@1.9.2
  - @backstage/integration@1.10.0
  - @backstage/catalog-model@1.4.5
  - @backstage/errors@1.2.4

## 0.4.1-next.1

### Patch Changes

- Updated dependencies
  - @backstage/catalog-model@1.4.5
  - @backstage/core-components@0.14.4-next.0
  - @backstage/core-plugin-api@1.9.1
  - @backstage/errors@1.2.4
  - @backstage/integration@1.10.0-next.0
  - @backstage/plugin-catalog-react@1.11.3-next.1

## 0.4.1-next.0

### Patch Changes

- Updated dependencies
  - @backstage/integration@1.10.0-next.0
  - @backstage/core-components@0.14.4-next.0
  - @backstage/catalog-model@1.4.5
  - @backstage/core-plugin-api@1.9.1
  - @backstage/errors@1.2.4
  - @backstage/plugin-catalog-react@1.11.3-next.0

## 0.4.0

### Minor Changes

- bc97524: Added ESLint rule `no-top-level-material-ui-4-imports` in the `github-issues` plugin to migrate the Material UI imports.

### Patch Changes

- e8f026a: Use ESM exports of react-use library
- Updated dependencies
  - @backstage/core-components@0.14.3
  - @backstage/plugin-catalog-react@1.11.2
  - @backstage/core-plugin-api@1.9.1
  - @backstage/catalog-model@1.4.5
  - @backstage/errors@1.2.4
  - @backstage/integration@1.9.1

## 0.3.0

### Minor Changes

- bc97524: Added ESLint rule `no-top-level-material-ui-4-imports` in the `github-issues` plugin to migrate the Material UI imports.

### Patch Changes

- e8f026a: Use ESM exports of react-use library
- Updated dependencies
  - @backstage/core-components@0.14.2
  - @backstage/plugin-catalog-react@1.11.1
  - @backstage/core-plugin-api@1.9.1
  - @backstage/catalog-model@1.4.5
  - @backstage/errors@1.2.4
  - @backstage/integration@1.9.1

## 0.2.20

### Patch Changes

- Updated dependencies
  - @backstage/integration@1.9.1
  - @backstage/core-components@0.14.1
  - @backstage/errors@1.2.4
  - @backstage/plugin-catalog-react@1.11.0
  - @backstage/catalog-model@1.4.5
  - @backstage/core-plugin-api@1.9.1

## 0.2.20-next.2

### Patch Changes

- Updated dependencies
  - @backstage/integration@1.9.1-next.2
  - @backstage/core-components@0.14.1-next.2
  - @backstage/plugin-catalog-react@1.11.0-next.2
  - @backstage/catalog-model@1.4.5-next.0
  - @backstage/core-plugin-api@1.9.1-next.1
  - @backstage/errors@1.2.4-next.0

## 0.2.20-next.1

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.14.1-next.1
  - @backstage/plugin-catalog-react@1.10.1-next.1
  - @backstage/core-plugin-api@1.9.1-next.1
  - @backstage/integration@1.9.1-next.1
  - @backstage/catalog-model@1.4.5-next.0
  - @backstage/errors@1.2.4-next.0

## 0.2.20-next.0

### Patch Changes

- Updated dependencies
  - @backstage/errors@1.2.4-next.0
  - @backstage/core-components@0.14.1-next.0
  - @backstage/plugin-catalog-react@1.10.1-next.0
  - @backstage/catalog-model@1.4.5-next.0
  - @backstage/core-plugin-api@1.9.1-next.0
  - @backstage/integration@1.9.1-next.0

## 0.2.19

### Patch Changes

- 8fe56a8: Widen `@types/react` dependency range to include version 18.
- Updated dependencies
  - @backstage/plugin-catalog-react@1.10.0
  - @backstage/core-components@0.14.0
  - @backstage/catalog-model@1.4.4
  - @backstage/integration@1.9.0
  - @backstage/core-plugin-api@1.9.0
  - @backstage/errors@1.2.3

## 0.2.19-next.3

### Patch Changes

- Updated dependencies
  - @backstage/integration@1.9.0-next.1
  - @backstage/core-components@0.14.0-next.2
  - @backstage/plugin-catalog-react@1.10.0-next.3
  - @backstage/catalog-model@1.4.4-next.0
  - @backstage/core-plugin-api@1.9.0-next.1
  - @backstage/errors@1.2.3

## 0.2.19-next.2

### Patch Changes

- 8fe56a8: Widen `@types/react` dependency range to include version 18.
- Updated dependencies
  - @backstage/core-components@0.14.0-next.1
  - @backstage/core-plugin-api@1.9.0-next.1
  - @backstage/plugin-catalog-react@1.10.0-next.2
  - @backstage/catalog-model@1.4.4-next.0
  - @backstage/errors@1.2.3
  - @backstage/integration@1.9.0-next.0

## 0.2.19-next.1

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.14.0-next.0
  - @backstage/catalog-model@1.4.4-next.0
  - @backstage/core-plugin-api@1.8.3-next.0
  - @backstage/integration@1.9.0-next.0
  - @backstage/plugin-catalog-react@1.9.4-next.1
  - @backstage/errors@1.2.3

## 0.2.19-next.0

### Patch Changes

- Updated dependencies
  - @backstage/plugin-catalog-react@1.9.4-next.0
  - @backstage/core-components@0.13.10
  - @backstage/catalog-model@1.4.3
  - @backstage/core-plugin-api@1.8.2
  - @backstage/errors@1.2.3
  - @backstage/integration@1.8.0

## 0.2.18

### Patch Changes

- bf92ae3: Updated dependency `octokit` to `^3.0.0`.
- 4016f21: Remove some unused dependencies
- Updated dependencies
  - @backstage/core-components@0.13.10
  - @backstage/core-plugin-api@1.8.2
  - @backstage/plugin-catalog-react@1.9.3
  - @backstage/catalog-model@1.4.3
  - @backstage/errors@1.2.3
  - @backstage/integration@1.8.0

## 0.2.18-next.2

### Patch Changes

- Updated dependencies
  - @backstage/plugin-catalog-react@1.9.3-next.2

## 0.2.18-next.1

### Patch Changes

- Updated dependencies
  - @backstage/core-plugin-api@1.8.2-next.0
  - @backstage/core-components@0.13.10-next.1
  - @backstage/plugin-catalog-react@1.9.3-next.1
  - @backstage/integration@1.8.0
  - @backstage/catalog-model@1.4.3
  - @backstage/errors@1.2.3

## 0.2.18-next.0

### Patch Changes

- bf92ae3: Updated dependency `octokit` to `^3.0.0`.
- 4016f21: Remove some unused dependencies
- Updated dependencies
  - @backstage/core-components@0.13.10-next.0
  - @backstage/plugin-catalog-react@1.9.3-next.0
  - @backstage/catalog-model@1.4.3
  - @backstage/core-plugin-api@1.8.1
  - @backstage/errors@1.2.3
  - @backstage/integration@1.8.0

## 0.2.17

### Patch Changes

- Updated dependencies
  - @backstage/core-plugin-api@1.8.1
  - @backstage/plugin-catalog-react@1.9.2
  - @backstage/core-components@0.13.9
  - @backstage/theme@0.5.0
  - @backstage/integration@1.8.0
  - @backstage/catalog-model@1.4.3
  - @backstage/errors@1.2.3

## 0.2.17-next.3

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.13.9-next.3
  - @backstage/catalog-model@1.4.3
  - @backstage/core-plugin-api@1.8.1-next.1
  - @backstage/errors@1.2.3
  - @backstage/integration@1.8.0-next.1
  - @backstage/theme@0.5.0-next.1
  - @backstage/plugin-catalog-react@1.9.2-next.3

## 0.2.17-next.2

### Patch Changes

- Updated dependencies
  - @backstage/theme@0.5.0-next.1
  - @backstage/plugin-catalog-react@1.9.2-next.2
  - @backstage/catalog-model@1.4.3
  - @backstage/core-components@0.13.9-next.2
  - @backstage/core-plugin-api@1.8.1-next.1
  - @backstage/errors@1.2.3
  - @backstage/integration@1.8.0-next.1

## 0.2.17-next.1

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.13.9-next.1
  - @backstage/core-plugin-api@1.8.1-next.1
  - @backstage/plugin-catalog-react@1.9.2-next.1
  - @backstage/integration@1.8.0-next.1
  - @backstage/catalog-model@1.4.3
  - @backstage/errors@1.2.3
  - @backstage/theme@0.5.0-next.0

## 0.2.17-next.0

### Patch Changes

- Updated dependencies
  - @backstage/core-plugin-api@1.8.1-next.0
  - @backstage/plugin-catalog-react@1.9.2-next.0
  - @backstage/core-components@0.13.9-next.0
  - @backstage/integration@1.8.0-next.0
  - @backstage/theme@0.5.0-next.0
  - @backstage/catalog-model@1.4.3
  - @backstage/errors@1.2.3

## 0.2.15

### Patch Changes

- 6c2b872153: Add official support for React 18.
- Updated dependencies
  - @backstage/plugin-catalog-react@1.9.0
  - @backstage/core-components@0.13.8
  - @backstage/integration@1.7.2
  - @backstage/core-plugin-api@1.8.0
  - @backstage/theme@0.4.4
  - @backstage/catalog-model@1.4.3
  - @backstage/errors@1.2.3

## 0.2.15-next.2

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.13.8-next.2
  - @backstage/plugin-catalog-react@1.9.0-next.2

## 0.2.15-next.1

### Patch Changes

- Updated dependencies
  - @backstage/integration@1.7.2-next.0
  - @backstage/plugin-catalog-react@1.9.0-next.1
  - @backstage/core-components@0.13.8-next.1
  - @backstage/catalog-model@1.4.3
  - @backstage/core-plugin-api@1.8.0-next.0
  - @backstage/errors@1.2.3
  - @backstage/theme@0.4.4-next.0

## 0.2.15-next.0

### Patch Changes

- 6c2b872153: Add official support for React 18.
- Updated dependencies
  - @backstage/core-components@0.13.7-next.0
  - @backstage/plugin-catalog-react@1.9.0-next.0
  - @backstage/core-plugin-api@1.8.0-next.0
  - @backstage/theme@0.4.4-next.0
  - @backstage/integration@1.7.1
  - @backstage/catalog-model@1.4.3
  - @backstage/errors@1.2.3

## 0.2.14

### Patch Changes

- 9a1fce352e: Updated dependency `@testing-library/jest-dom` to `^6.0.0`.
- f95af4e540: Updated dependency `@testing-library/dom` to `^9.0.0`.
- 7bd0a8ab3c: Filters out entities that belonged to a different github instance other than the one configured by the plugin
- Updated dependencies
  - @backstage/integration@1.7.1
  - @backstage/plugin-catalog-react@1.8.5
  - @backstage/core-plugin-api@1.7.0
  - @backstage/core-components@0.13.6
  - @backstage/catalog-model@1.4.3
  - @backstage/errors@1.2.3
  - @backstage/theme@0.4.3

## 0.2.14-next.2

### Patch Changes

- 7bd0a8ab3c: Filters out entities that belonged to a different github instance other than the one configured by the plugin
- Updated dependencies
  - @backstage/core-components@0.13.6-next.2
  - @backstage/core-plugin-api@1.7.0-next.1
  - @backstage/catalog-model@1.4.3-next.0
  - @backstage/plugin-catalog-react@1.8.5-next.2
  - @backstage/integration@1.7.1-next.1
  - @backstage/errors@1.2.3-next.0
  - @backstage/theme@0.4.3-next.0

## 0.2.14-next.1

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.13.6-next.1
  - @backstage/plugin-catalog-react@1.8.5-next.1
  - @backstage/core-plugin-api@1.7.0-next.0
  - @backstage/catalog-model@1.4.2
  - @backstage/errors@1.2.2
  - @backstage/integration@1.7.1-next.0
  - @backstage/theme@0.4.2

## 0.2.14-next.0

### Patch Changes

- Updated dependencies
  - @backstage/integration@1.7.1-next.0
  - @backstage/plugin-catalog-react@1.8.5-next.0
  - @backstage/core-plugin-api@1.7.0-next.0
  - @backstage/core-components@0.13.6-next.0
  - @backstage/catalog-model@1.4.2
  - @backstage/errors@1.2.2
  - @backstage/theme@0.4.2

## 0.2.13

### Patch Changes

- 482bb5c0bbf8: Moved `@types/react` to be a regular dependency
- 406b786a2a2c: Mark package as being free of side effects, allowing more optimized Webpack builds.
- 8cec7664e146: Removed `@types/node` dependency
- Updated dependencies
  - @backstage/plugin-catalog-react@1.8.4
  - @backstage/core-components@0.13.5
  - @backstage/catalog-model@1.4.2
  - @backstage/core-plugin-api@1.6.0
  - @backstage/errors@1.2.2
  - @backstage/integration@1.7.0
  - @backstage/theme@0.4.2

## 0.2.13-next.3

### Patch Changes

- 406b786a2a2c: Mark package as being free of side effects, allowing more optimized Webpack builds.
- Updated dependencies
  - @backstage/catalog-model@1.4.2-next.2
  - @backstage/core-components@0.13.5-next.3
  - @backstage/core-plugin-api@1.6.0-next.3
  - @backstage/errors@1.2.2-next.0
  - @backstage/integration@1.7.0-next.3
  - @backstage/plugin-catalog-react@1.8.4-next.3
  - @backstage/theme@0.4.2-next.0

## 0.2.13-next.2

### Patch Changes

- 8cec7664e146: Removed `@types/node` dependency
- Updated dependencies
  - @backstage/core-components@0.13.5-next.2
  - @backstage/core-plugin-api@1.6.0-next.2
  - @backstage/plugin-catalog-react@1.8.4-next.2
  - @backstage/integration@1.7.0-next.2
  - @backstage/catalog-model@1.4.2-next.1
  - @backstage/errors@1.2.1
  - @backstage/theme@0.4.1

## 0.2.13-next.1

### Patch Changes

- Updated dependencies
  - @backstage/plugin-catalog-react@1.8.4-next.1
  - @backstage/core-components@0.13.5-next.1
  - @backstage/integration@1.7.0-next.1
  - @backstage/catalog-model@1.4.2-next.0
  - @backstage/core-plugin-api@1.6.0-next.1
  - @backstage/errors@1.2.1
  - @backstage/theme@0.4.1

## 0.2.12-next.0

### Patch Changes

- 482bb5c0bbf8: Moved `@types/react` to be a regular dependency
- Updated dependencies
  - @backstage/integration@1.7.0-next.0
  - @backstage/core-plugin-api@1.6.0-next.0
  - @backstage/core-components@0.13.5-next.0
  - @backstage/catalog-model@1.4.1
  - @backstage/errors@1.2.1
  - @backstage/theme@0.4.1
  - @backstage/plugin-catalog-react@1.8.3-next.0

## 0.2.10

### Patch Changes

- 12a8c94eda8d: Add package repository and homepage metadata
- Updated dependencies
  - @backstage/integration@1.6.0
  - @backstage/core-components@0.13.4
  - @backstage/plugin-catalog-react@1.8.1
  - @backstage/core-plugin-api@1.5.3
  - @backstage/catalog-model@1.4.1
  - @backstage/errors@1.2.1
  - @backstage/theme@0.4.1

## 0.2.10-next.2

### Patch Changes

- Updated dependencies
  - @backstage/plugin-catalog-react@1.8.1-next.1

## 0.2.10-next.1

### Patch Changes

- 12a8c94eda8d: Add package repository and homepage metadata
- Updated dependencies
  - @backstage/integration@1.5.1
  - @backstage/catalog-model@1.4.1
  - @backstage/core-components@0.13.4-next.0
  - @backstage/core-plugin-api@1.5.3
  - @backstage/errors@1.2.1
  - @backstage/theme@0.4.1
  - @backstage/plugin-catalog-react@1.8.1-next.0

## 0.2.10-next.0

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.13.4-next.0
  - @backstage/core-plugin-api@1.5.3
  - @backstage/plugin-catalog-react@1.8.1-next.0
  - @backstage/catalog-model@1.4.1
  - @backstage/errors@1.2.1
  - @backstage/integration@1.5.1
  - @backstage/theme@0.4.1

## 0.2.9

### Patch Changes

- Updated dependencies
  - @backstage/theme@0.4.1
  - @backstage/errors@1.2.1
  - @backstage/plugin-catalog-react@1.8.0
  - @backstage/core-components@0.13.3
  - @backstage/core-plugin-api@1.5.3
  - @backstage/catalog-model@1.4.1
  - @backstage/integration@1.5.1

## 0.2.9-next.2

### Patch Changes

- Updated dependencies
  - @backstage/plugin-catalog-react@1.8.0-next.2
  - @backstage/theme@0.4.1-next.1
  - @backstage/core-plugin-api@1.5.3-next.1
  - @backstage/core-components@0.13.3-next.2
  - @backstage/catalog-model@1.4.1-next.0
  - @backstage/errors@1.2.1-next.0
  - @backstage/integration@1.5.1-next.0

## 0.2.9-next.1

### Patch Changes

- Updated dependencies
  - @backstage/theme@0.4.1-next.0
  - @backstage/core-components@0.13.3-next.1
  - @backstage/core-plugin-api@1.5.3-next.0
  - @backstage/plugin-catalog-react@1.7.1-next.1

## 0.2.9-next.0

### Patch Changes

- Updated dependencies
  - @backstage/errors@1.2.1-next.0
  - @backstage/core-components@0.13.3-next.0
  - @backstage/catalog-model@1.4.1-next.0
  - @backstage/core-plugin-api@1.5.2
  - @backstage/integration@1.5.1-next.0
  - @backstage/theme@0.4.0
  - @backstage/plugin-catalog-react@1.7.1-next.0

## 0.2.8

### Patch Changes

- Updated dependencies
  - @backstage/core-plugin-api@1.5.2
  - @backstage/core-components@0.13.2
  - @backstage/theme@0.4.0
  - @backstage/integration@1.5.0
  - @backstage/plugin-catalog-react@1.7.0
  - @backstage/catalog-model@1.4.0
  - @backstage/errors@1.2.0

## 0.2.8-next.3

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.13.2-next.3
  - @backstage/catalog-model@1.4.0-next.1
  - @backstage/core-plugin-api@1.5.2-next.0
  - @backstage/errors@1.2.0-next.0
  - @backstage/integration@1.5.0-next.0
  - @backstage/theme@0.4.0-next.1
  - @backstage/plugin-catalog-react@1.7.0-next.3

## 0.2.8-next.2

### Patch Changes

- Updated dependencies
  - @backstage/theme@0.4.0-next.1
  - @backstage/plugin-catalog-react@1.7.0-next.2
  - @backstage/core-components@0.13.2-next.2
  - @backstage/core-plugin-api@1.5.2-next.0

## 0.2.8-next.1

### Patch Changes

- Updated dependencies
  - @backstage/integration@1.5.0-next.0
  - @backstage/errors@1.2.0-next.0
  - @backstage/core-components@0.13.2-next.1
  - @backstage/plugin-catalog-react@1.7.0-next.1
  - @backstage/catalog-model@1.4.0-next.0
  - @backstage/core-plugin-api@1.5.2-next.0
  - @backstage/theme@0.4.0-next.0

## 0.2.8-next.0

### Patch Changes

- Updated dependencies
  - @backstage/plugin-catalog-react@1.7.0-next.0
  - @backstage/theme@0.4.0-next.0
  - @backstage/integration@1.4.5
  - @backstage/core-components@0.13.2-next.0
  - @backstage/core-plugin-api@1.5.1
  - @backstage/catalog-model@1.3.0
  - @backstage/errors@1.1.5

## 0.2.7

### Patch Changes

- Updated dependencies
  - @backstage/theme@0.3.0
  - @backstage/plugin-catalog-react@1.6.0
  - @backstage/integration@1.4.5
  - @backstage/core-components@0.13.1
  - @backstage/catalog-model@1.3.0
  - @backstage/core-plugin-api@1.5.1
  - @backstage/errors@1.1.5

## 0.2.7-next.2

### Patch Changes

- Updated dependencies
  - @backstage/theme@0.3.0-next.0
  - @backstage/core-components@0.13.1-next.1
  - @backstage/plugin-catalog-react@1.6.0-next.2
  - @backstage/core-plugin-api@1.5.1

## 0.2.7-next.1

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.13.1-next.0
  - @backstage/core-plugin-api@1.5.1
  - @backstage/plugin-catalog-react@1.6.0-next.1

## 0.2.7-next.0

### Patch Changes

- Updated dependencies
  - @backstage/plugin-catalog-react@1.6.0-next.0
  - @backstage/integration@1.4.5-next.0
  - @backstage/core-components@0.13.0
  - @backstage/core-plugin-api@1.5.1
  - @backstage/catalog-model@1.3.0
  - @backstage/errors@1.1.5
  - @backstage/theme@0.2.19

## 0.2.6

### Patch Changes

- 29ba8267d69: Updated dependency `@material-ui/lab` to `4.0.0-alpha.61`.
- e0c6e8b9c3c: Update peer dependencies
- Updated dependencies
  - @backstage/core-components@0.13.0
  - @backstage/plugin-catalog-react@1.5.0
  - @backstage/theme@0.2.19
  - @backstage/core-plugin-api@1.5.1
  - @backstage/catalog-model@1.3.0
  - @backstage/integration@1.4.4
  - @backstage/errors@1.1.5

## 0.2.6-next.3

### Patch Changes

- Updated dependencies
  - @backstage/plugin-catalog-react@1.5.0-next.3
  - @backstage/catalog-model@1.3.0-next.0
  - @backstage/core-components@0.13.0-next.3
  - @backstage/core-plugin-api@1.5.1-next.1
  - @backstage/errors@1.1.5
  - @backstage/integration@1.4.4-next.0
  - @backstage/theme@0.2.19-next.0

## 0.2.6-next.2

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.12.6-next.2
  - @backstage/plugin-catalog-react@1.4.1-next.2
  - @backstage/core-plugin-api@1.5.1-next.1
  - @backstage/catalog-model@1.2.1
  - @backstage/errors@1.1.5
  - @backstage/integration@1.4.4-next.0
  - @backstage/theme@0.2.19-next.0

## 0.2.6-next.1

### Patch Changes

- 29ba8267d69: Updated dependency `@material-ui/lab` to `4.0.0-alpha.61`.
- e0c6e8b9c3c: Update peer dependencies
- Updated dependencies
  - @backstage/core-components@0.12.6-next.1
  - @backstage/core-plugin-api@1.5.1-next.0
  - @backstage/plugin-catalog-react@1.4.1-next.1
  - @backstage/integration@1.4.4-next.0
  - @backstage/theme@0.2.19-next.0
  - @backstage/catalog-model@1.2.1
  - @backstage/errors@1.1.5

## 0.2.6-next.0

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.12.6-next.0
  - @backstage/plugin-catalog-react@1.4.1-next.0
  - @backstage/core-plugin-api@1.5.0
  - @backstage/integration@1.4.3
  - @backstage/catalog-model@1.2.1
  - @backstage/errors@1.1.5
  - @backstage/theme@0.2.18

## 0.2.5

### Patch Changes

- 52b0022dab7: Updated dependency `msw` to `^1.0.0`.
- Updated dependencies
  - @backstage/core-components@0.12.5
  - @backstage/plugin-catalog-react@1.4.0
  - @backstage/errors@1.1.5
  - @backstage/core-plugin-api@1.5.0
  - @backstage/catalog-model@1.2.1
  - @backstage/integration@1.4.3
  - @backstage/theme@0.2.18

## 0.2.5-next.2

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.12.5-next.2
  - @backstage/plugin-catalog-react@1.4.0-next.2
  - @backstage/core-plugin-api@1.5.0-next.2
  - @backstage/integration@1.4.3-next.0

## 0.2.5-next.1

### Patch Changes

- 52b0022dab7: Updated dependency `msw` to `^1.0.0`.
- Updated dependencies
  - @backstage/core-components@0.12.5-next.1
  - @backstage/errors@1.1.5-next.0
  - @backstage/core-plugin-api@1.4.1-next.1
  - @backstage/integration@1.4.3-next.0
  - @backstage/theme@0.2.18-next.0
  - @backstage/plugin-catalog-react@1.4.0-next.1
  - @backstage/catalog-model@1.2.1-next.1

## 0.2.5-next.0

### Patch Changes

- Updated dependencies
  - @backstage/plugin-catalog-react@1.4.0-next.0
  - @backstage/core-plugin-api@1.4.1-next.0
  - @backstage/catalog-model@1.2.1-next.0
  - @backstage/core-components@0.12.5-next.0
  - @backstage/errors@1.1.4
  - @backstage/integration@1.4.2
  - @backstage/theme@0.2.17

## 0.2.4

### Patch Changes

- 3f88ae9d0a: Updated README.md examples to use correct components and fixed some syntax errors.
- Updated dependencies
  - @backstage/core-components@0.12.4
  - @backstage/catalog-model@1.2.0
  - @backstage/theme@0.2.17
  - @backstage/core-plugin-api@1.4.0
  - @backstage/plugin-catalog-react@1.3.0
  - @backstage/errors@1.1.4
  - @backstage/integration@1.4.2

## 0.2.4-next.2

### Patch Changes

- Updated dependencies
  - @backstage/catalog-model@1.2.0-next.1
  - @backstage/core-components@0.12.4-next.1
  - @backstage/core-plugin-api@1.3.0
  - @backstage/errors@1.1.4
  - @backstage/integration@1.4.2
  - @backstage/theme@0.2.16
  - @backstage/plugin-catalog-react@1.3.0-next.2

## 0.2.4-next.1

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.12.4-next.0
  - @backstage/plugin-catalog-react@1.3.0-next.1
  - @backstage/catalog-model@1.1.6-next.0
  - @backstage/core-plugin-api@1.3.0
  - @backstage/errors@1.1.4
  - @backstage/integration@1.4.2
  - @backstage/theme@0.2.16

## 0.2.4-next.0

### Patch Changes

- 3f88ae9d0a: Updated README.md examples to use correct components and fixed some syntax errors.
- Updated dependencies
  - @backstage/plugin-catalog-react@1.3.0-next.0
  - @backstage/catalog-model@1.1.6-next.0

## 0.2.3

### Patch Changes

- Updated dependencies
  - @backstage/catalog-model@1.1.5
  - @backstage/plugin-catalog-react@1.2.4
  - @backstage/core-components@0.12.3
  - @backstage/core-plugin-api@1.3.0
  - @backstage/errors@1.1.4
  - @backstage/integration@1.4.2
  - @backstage/theme@0.2.16

## 0.2.3-next.2

### Patch Changes

- Updated dependencies
  - @backstage/core-plugin-api@1.3.0-next.1
  - @backstage/plugin-catalog-react@1.2.4-next.2
  - @backstage/catalog-model@1.1.5-next.1
  - @backstage/core-components@0.12.3-next.2
  - @backstage/errors@1.1.4
  - @backstage/integration@1.4.2-next.0
  - @backstage/theme@0.2.16

## 0.2.3-next.1

### Patch Changes

- Updated dependencies
  - @backstage/catalog-model@1.1.5-next.1
  - @backstage/core-components@0.12.3-next.1
  - @backstage/core-plugin-api@1.2.1-next.0
  - @backstage/errors@1.1.4
  - @backstage/integration@1.4.2-next.0
  - @backstage/theme@0.2.16
  - @backstage/plugin-catalog-react@1.2.4-next.1

## 0.2.3-next.0

### Patch Changes

- Updated dependencies
  - @backstage/catalog-model@1.1.5-next.0
  - @backstage/plugin-catalog-react@1.2.4-next.0
  - @backstage/core-components@0.12.3-next.0
  - @backstage/core-plugin-api@1.2.0
  - @backstage/errors@1.1.4
  - @backstage/integration@1.4.1
  - @backstage/theme@0.2.16

## 0.2.2

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.12.2
  - @backstage/plugin-catalog-react@1.2.3

## 0.2.1

### Patch Changes

- 3280711113: Updated dependency `msw` to `^0.49.0`.
- Updated dependencies
  - @backstage/core-plugin-api@1.2.0
  - @backstage/core-components@0.12.1
  - @backstage/errors@1.1.4
  - @backstage/plugin-catalog-react@1.2.2
  - @backstage/integration@1.4.1
  - @backstage/catalog-model@1.1.4
  - @backstage/theme@0.2.16

## 0.2.1-next.4

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.12.1-next.4
  - @backstage/plugin-catalog-react@1.2.2-next.4
  - @backstage/catalog-model@1.1.4-next.1
  - @backstage/core-plugin-api@1.2.0-next.2
  - @backstage/errors@1.1.4-next.1
  - @backstage/integration@1.4.1-next.1
  - @backstage/theme@0.2.16

## 0.2.1-next.3

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.12.1-next.3
  - @backstage/catalog-model@1.1.4-next.1
  - @backstage/core-plugin-api@1.2.0-next.2
  - @backstage/errors@1.1.4-next.1
  - @backstage/integration@1.4.1-next.1
  - @backstage/theme@0.2.16
  - @backstage/plugin-catalog-react@1.2.2-next.3

## 0.2.1-next.2

### Patch Changes

- Updated dependencies
  - @backstage/core-plugin-api@1.2.0-next.2
  - @backstage/core-components@0.12.1-next.2
  - @backstage/plugin-catalog-react@1.2.2-next.2
  - @backstage/catalog-model@1.1.4-next.1
  - @backstage/errors@1.1.4-next.1
  - @backstage/integration@1.4.1-next.1
  - @backstage/theme@0.2.16

## 0.2.1-next.1

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.12.1-next.1
  - @backstage/core-plugin-api@1.1.1-next.1
  - @backstage/plugin-catalog-react@1.2.2-next.1
  - @backstage/integration@1.4.1-next.1
  - @backstage/catalog-model@1.1.4-next.1
  - @backstage/errors@1.1.4-next.1
  - @backstage/theme@0.2.16

## 0.2.1-next.0

### Patch Changes

- 3280711113: Updated dependency `msw` to `^0.49.0`.
- Updated dependencies
  - @backstage/core-components@0.12.1-next.0
  - @backstage/core-plugin-api@1.1.1-next.0
  - @backstage/integration@1.4.1-next.0
  - @backstage/plugin-catalog-react@1.2.2-next.0
  - @backstage/catalog-model@1.1.4-next.0
  - @backstage/errors@1.1.4-next.0
  - @backstage/theme@0.2.16

## 0.2.0

### Minor Changes

- ead285b9e4: **BREAKING**: Changed the casing of all exported types to have a lowercase "h" in "github". E.g. "GitHubIssuesPage" was renamed to "GithubIssuesPage". Please rename your imports where necessary.

### Patch Changes

- c8dd2a8c87: Stripping specific issues URL already present to target base issues URL.
- c1784a4980: Replaces in-code uses of `GitHub` with `Github` and deprecates old versions.
- f905853ad6: Prefer using `Link` from `@backstage/core-components` rather than material-UI.
- Updated dependencies
  - @backstage/plugin-catalog-react@1.2.1
  - @backstage/core-components@0.12.0
  - @backstage/core-plugin-api@1.1.0
  - @backstage/integration@1.4.0
  - @backstage/catalog-model@1.1.3
  - @backstage/errors@1.1.3
  - @backstage/theme@0.2.16

## 0.2.0-next.1

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.12.0-next.1
  - @backstage/catalog-model@1.1.3-next.0
  - @backstage/core-plugin-api@1.1.0-next.0
  - @backstage/errors@1.1.3-next.0
  - @backstage/integration@1.4.0-next.0
  - @backstage/theme@0.2.16
  - @backstage/plugin-catalog-react@1.2.1-next.1

## 0.2.0-next.0

### Minor Changes

- ead285b9e4: **BREAKING**: Changed the casing of all exported types to have a lowercase "h" in "github". E.g. "GitHubIssuesPage" was renamed to "GithubIssuesPage". Please rename your imports where necessary.

### Patch Changes

- c8dd2a8c87: Stripping specific issues URL already present to target base issues URL.
- c1784a4980: Replaces in-code uses of `GitHub` with `Github` and deprecates old versions.
- f905853ad6: Prefer using `Link` from `@backstage/core-components` rather than material-UI.
- Updated dependencies
  - @backstage/plugin-catalog-react@1.2.1-next.0
  - @backstage/core-components@0.12.0-next.0
  - @backstage/core-plugin-api@1.1.0-next.0
  - @backstage/integration@1.4.0-next.0
  - @backstage/catalog-model@1.1.3-next.0
  - @backstage/errors@1.1.3-next.0
  - @backstage/theme@0.2.16

## 0.1.2

### Patch Changes

- 8c7bff2bb4: Updated the `luxon` dependency to 3.x
- 719ccbb963: Properly filter on relations instead of the spec, when finding by owner
- df226e124c: Add filtering and ordering to the graphql query
- Updated dependencies
  - @backstage/catalog-model@1.1.2
  - @backstage/plugin-catalog-react@1.2.0
  - @backstage/core-components@0.11.2
  - @backstage/core-plugin-api@1.0.7
  - @backstage/errors@1.1.2
  - @backstage/integration@1.3.2
  - @backstage/theme@0.2.16

## 0.1.2-next.2

### Patch Changes

- df226e124c: Add filtering and ordering to the graphql query
- Updated dependencies
  - @backstage/plugin-catalog-react@1.2.0-next.2
  - @backstage/catalog-model@1.1.2-next.2
  - @backstage/core-components@0.11.2-next.2
  - @backstage/core-plugin-api@1.0.7-next.2
  - @backstage/errors@1.1.2-next.2
  - @backstage/integration@1.3.2-next.2
  - @backstage/theme@0.2.16

## 0.1.2-next.1

### Patch Changes

- 8c7bff2bb4: Updated the `luxon` dependency to 3.x
- 719ccbb963: Properly filter on relations instead of the spec, when finding by owner
- Updated dependencies
  - @backstage/plugin-catalog-react@1.2.0-next.1
  - @backstage/core-components@0.11.2-next.1
  - @backstage/core-plugin-api@1.0.7-next.1
  - @backstage/catalog-model@1.1.2-next.1
  - @backstage/errors@1.1.2-next.1
  - @backstage/integration@1.3.2-next.1
  - @backstage/theme@0.2.16

## 0.1.2-next.0

### Patch Changes

- Updated dependencies
  - @backstage/catalog-model@1.1.2-next.0
  - @backstage/core-components@0.11.2-next.0
  - @backstage/plugin-catalog-react@1.1.5-next.0
  - @backstage/core-plugin-api@1.0.7-next.0
  - @backstage/errors@1.1.2-next.0
  - @backstage/integration@1.3.2-next.0
  - @backstage/theme@0.2.16

## 0.1.1

### Patch Changes

- 7d47def9c4: Removed dependency on `@types/jest`.
- 667d917488: Updated dependency `msw` to `^0.47.0`.
- 87ec2ba4d6: Updated dependency `msw` to `^0.46.0`.
- bf5e9030eb: Updated dependency `msw` to `^0.45.0`.
- Updated dependencies
  - @backstage/core-components@0.11.1
  - @backstage/core-plugin-api@1.0.6
  - @backstage/plugin-catalog-react@1.1.4
  - @backstage/integration@1.3.1
  - @backstage/catalog-model@1.1.1
  - @backstage/errors@1.1.1

## 0.1.1-next.2

### Patch Changes

- 7d47def9c4: Removed dependency on `@types/jest`.
- Updated dependencies
  - @backstage/plugin-catalog-react@1.1.4-next.2
  - @backstage/catalog-model@1.1.1-next.0
  - @backstage/core-components@0.11.1-next.3
  - @backstage/core-plugin-api@1.0.6-next.3
  - @backstage/errors@1.1.1-next.0
  - @backstage/integration@1.3.1-next.2

## 0.1.1-next.1

### Patch Changes

- 667d917488: Updated dependency `msw` to `^0.47.0`.
- 87ec2ba4d6: Updated dependency `msw` to `^0.46.0`.
- Updated dependencies
  - @backstage/integration@1.3.1-next.1
  - @backstage/core-components@0.11.1-next.2
  - @backstage/core-plugin-api@1.0.6-next.2

## 0.1.1-next.0

### Patch Changes

- bf5e9030eb: Updated dependency `msw` to `^0.45.0`.
- Updated dependencies
  - @backstage/core-plugin-api@1.0.6-next.0
  - @backstage/core-components@0.11.1-next.0
  - @backstage/integration@1.3.1-next.0
  - @backstage/plugin-catalog-react@1.1.4-next.0

## 0.1.0

### Minor Changes

- ffd5e47fb5: New plugin for displaying GitHub Issues added

### Patch Changes

- 347ea327c2: Moved communication with GitHub graphql API to the dedicated plugin API.
  Fixes issue when no GitHub Issues are rendered when partial failure is returned from GitHub API.
- b522f49403: Updated dependency `@spotify/prettier-config` to `^14.0.0`.
- Updated dependencies
  - @backstage/integration@1.3.0
  - @backstage/core-components@0.11.0
  - @backstage/core-plugin-api@1.0.5
  - @backstage/plugin-catalog-react@1.1.3

## 0.1.0-next.0

### Minor Changes

- ffd5e47fb5: New plugin for displaying GitHub Issues added

### Patch Changes

- b522f49403: Updated dependency `@spotify/prettier-config` to `^14.0.0`.
- Updated dependencies
  - @backstage/plugin-catalog-react@1.1.3-next.2
  - @backstage/core-components@0.11.0-next.2
