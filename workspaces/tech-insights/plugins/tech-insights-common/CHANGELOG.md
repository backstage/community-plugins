# @backstage-community/plugin-tech-insights-common

## 0.2.19

### Patch Changes

- e516773: Remove usages of deprecated references and usage of @backstage/backend-common
- e516773: Backstage version bump to v1.31.1

## 0.2.18

### Patch Changes

- 1d33996: Added links property for checks, to allow the UI to render links for users to click and get more information about individual checks, what they mean, how to adhere to them, etc.

## 0.2.17

### Patch Changes

- a84eb44: Move client to common package and allow to use backend auth system

## 0.2.16

### Patch Changes

- 00d148d: Backstage version bump to v1.30.2

## 0.2.15

### Patch Changes

- 794cc8b: Fix api reports generated with the wrong name
  Update @backstage/cli to 0.26.11
  Add missing Backstage fields in `package.json`

## 0.2.14

### Patch Changes

- cbad35a: Updated dependencies.

## 0.2.13

### Patch Changes

- 193a2a3: Migrated from the [backstage/backstage](https://github.com/backstage/backstage) monorepo.

## 0.2.12

### Patch Changes

- 406b786a2a2c: Mark package as being free of side effects, allowing more optimized Webpack builds.
- Updated dependencies
  - @backstage/types@1.1.1

## 0.2.12-next.0

### Patch Changes

- 406b786a2a2c: Mark package as being free of side effects, allowing more optimized Webpack builds.
- Updated dependencies
  - @backstage/types@1.1.1-next.0

## 0.2.11

### Patch Changes

- Updated dependencies
  - @backstage/types@1.1.0

## 0.2.10

### Patch Changes

- 4024b37449: TechInsightsApi interface now has getFactSchemas() method.
  TechInsightsClient now implements method getFactSchemas().

  **BREAKING** FactSchema type moved from @backstage-community/plugin-tech-insights-node into @backstage-community/plugin-tech-insights-common

  These changes are **required** if you were importing this type directly.

  ```diff
  - import { FactSchema } from '@backstage-community/plugin-tech-insights-node';
  + import { FactSchema } from '@backstage-community/plugin-tech-insights-common';
  ```

- Updated dependencies
  - @backstage/types@1.0.2

## 0.2.10-next.0

### Patch Changes

- 4024b37449: TechInsightsApi interface now has getFactSchemas() method.
  TechInsightsClient now implements method getFactSchemas().

  **BREAKING** FactSchema type moved from @backstage-community/plugin-tech-insights-node into @backstage-community/plugin-tech-insights-common

  These changes are **required** if you were importing this type directly.

  ```diff
  - import { FactSchema } from '@backstage-community/plugin-tech-insights-node';
  + import { FactSchema } from '@backstage-community/plugin-tech-insights-common';
  ```

- Updated dependencies
  - @backstage/types@1.0.2

## 0.2.9

### Patch Changes

- Updated dependencies
  - @backstage/types@1.0.2

## 0.2.9-next.1

### Patch Changes

- Updated dependencies
  - @backstage/types@1.0.2-next.1

## 0.2.9-next.0

### Patch Changes

- Updated dependencies
  - @backstage/types@1.0.2-next.0

## 0.2.8

### Patch Changes

- Updated dependencies
  - @backstage/types@1.0.1

## 0.2.8-next.0

### Patch Changes

- Updated dependencies
  - @backstage/types@1.0.1-next.0

## 0.2.7

### Patch Changes

- Updated dependencies
  - @backstage/types@1.0.0

## 0.2.7-next.2

### Patch Changes

- Updated dependencies
  - @backstage/types@1.0.0

## 0.2.7-next.1

### Patch Changes

- Updated dependencies
  - @backstage/types@1.0.0

## 0.2.7-next.0

### Patch Changes

- Updated dependencies
  - @backstage/types@1.0.0

## 0.2.6

### Patch Changes

- 29f782eb37: Updated dependency `@types/luxon` to `^3.0.0`.

## 0.2.6-next.0

### Patch Changes

- 29f782eb37: Updated dependency `@types/luxon` to `^3.0.0`.

## 0.2.5

### Patch Changes

- 4e9a90e307: Updated dependency `luxon` to `^3.0.0`.

## 0.2.5-next.0

### Patch Changes

- 4e9a90e307: Updated dependency `luxon` to `^3.0.0`.

## 0.2.4

### Patch Changes

- Updated dependencies
  - @backstage/types@1.0.0

## 0.2.3

### Patch Changes

- Fix for the previous release with missing type declarations.
- Updated dependencies
  - @backstage/types@0.1.3

## 0.2.2

### Patch Changes

- c77c5c7eb6: Added `backstage.role` to `package.json`
- Updated dependencies
  - @backstage/types@0.1.2

## 0.2.1

### Patch Changes

- a60eb0f0dd: adding new operation to run checks for multiple entities in one request

## 0.2.0

### Minor Changes

- b5bd60fddc: Added new property 'result' in CheckResult in @backstage-community/plugin-tech-insights-common. This property is later used in `@backstage-community/plugin-tech-insights` package.
