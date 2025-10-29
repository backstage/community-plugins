# @backstage-community/plugin-tech-insights-backend

## 2.4.2

### Patch Changes

- e28273e: add index to improve performance of fact deletion

## 2.4.1

### Patch Changes

- Updated dependencies [ba5bf7b]
  - @backstage-community/plugin-tech-insights-common@0.7.1
  - @backstage-community/plugin-tech-insights-node@2.5.1

## 2.4.0

### Minor Changes

- a01ae4e: Backstage version bump to v1.39.0

### Patch Changes

- Updated dependencies [d6411fe]
- Updated dependencies [a01ae4e]
  - @backstage-community/plugin-tech-insights-common@0.7.0
  - @backstage-community/plugin-tech-insights-node@2.5.0

## 2.3.0

### Minor Changes

- ac739ca: This version adds `techInsightsCheckReadPermission`, `techInsightsCheckUpdatePermission`, and `techInsightsFactRetrieverReadPermission`, which can be used to permission Tech Insights functionalities.

### Patch Changes

- 0a26736: fix null timestamp error when using tech-insights with maturity plugin
- Updated dependencies [375612d]
- Updated dependencies [ac739ca]
  - @backstage-community/plugin-tech-insights-node@2.4.0
  - @backstage-community/plugin-tech-insights-common@0.6.0

## 2.2.1

### Patch Changes

- 208e250: Updated dependency `@types/uuid` to `^10.0.0`.

## 2.2.0

### Minor Changes

- e919e53: Backstage version bump to v1.35.1

### Patch Changes

- f015469: Introducing a new tech insights react plugin for reusuable frontend utilities. All migrated components and APIs have been marked as deprecated. Please update your imports to come from `@backstage-community/plugin-tech-insights-react`

  Package json files for each plugin have been updated to reflect the new plugin in the Backstage `pluginPackages` metadata.

- c107e0f: Deprecates `TechInsightCheck` from the `tech-insights-node` library in favor of `Check` coming from the `tech-insights-common` library.

  With this change comes a refactor of `Check` from a type to an interface.

  The `TechInsightCheck` interface will be removed from the `tech-insights-node` plugin in it's next major release.

  Importing `Check` from `@backstage-community/plugin-tech-insights-common/client` has been deprecated in favor of importing directly from `@backstage-community/plugin-tech-insights-common`.

- Updated dependencies [f015469]
- Updated dependencies [e919e53]
- Updated dependencies [c107e0f]
  - @backstage-community/plugin-tech-insights-common@0.5.0
  - @backstage-community/plugin-tech-insights-node@2.3.0

## 2.1.1

### Patch Changes

- 47284ff: Removed usages of `@backstage/backend-tasks`

## 2.1.0

### Minor Changes

- 5abfb11: Backstage version bump to v1.34.2

### Patch Changes

- Updated dependencies [5abfb11]
  - @backstage-community/plugin-tech-insights-common@0.4.0
  - @backstage-community/plugin-tech-insights-node@2.2.0

## 2.0.2

### Patch Changes

- Updated dependencies [d9d9039]
  - @backstage-community/plugin-tech-insights-node@2.1.1

## 2.0.1

### Patch Changes

- Updated dependencies [5289c38]
  - @backstage-community/plugin-tech-insights-common@0.3.0
  - @backstage-community/plugin-tech-insights-node@2.1.0

## 2.0.0

### Major Changes

- c3bbe0f: In order to use UrlReaderService in fact retrievers, UrlReaderService has been added to FactRetrieverContext.

### Minor Changes

- 306121a: Allow tech insights backend to schedule a single job.

### Patch Changes

- Updated dependencies [c3bbe0f]
  - @backstage-community/plugin-tech-insights-node@2.0.0

## 1.2.3

### Patch Changes

- Updated dependencies [331daba]
  - @backstage-community/plugin-tech-insights-common@0.2.21
  - @backstage-community/plugin-tech-insights-node@1.0.3

## 1.2.2

### Patch Changes

- 7a14237: Backstage version bump to v1.32.2
- Updated dependencies [7a14237]
  - @backstage-community/plugin-tech-insights-common@0.2.20
  - @backstage-community/plugin-tech-insights-node@1.0.2

## 1.2.1

### Patch Changes

- 6a4787a: Add auth token logic to the fact retriever example in the README.
  This makes it possible to copy it directly as a baseline for new fact retrievers.

## 1.2.0

### Minor Changes

- 0f5c58a: Increment the schema version of the `techdocsFactRetriever`.

### Patch Changes

- e516773: Remove usages of deprecated references and usage of @backstage/backend-common
- e516773: Backstage version bump to v1.31.1
- Updated dependencies [e516773]
- Updated dependencies [e516773]
  - @backstage-community/plugin-tech-insights-common@0.2.19
  - @backstage-community/plugin-tech-insights-node@1.0.1

## 1.1.0

### Minor Changes

- fad299b: Adds fact to represent presence of the `backstage.io/techdocs-entity` annotation.

## 1.0.0

### Major Changes

- 9871d0b: **BREAKING**: The service no longer accepts the deprecated `TokenManager` instance, but instead the `AuthService` is now required where it used to be optional. If you are using the new backend system module, this does not affect you.

### Patch Changes

- Updated dependencies [9871d0b]
  - @backstage-community/plugin-tech-insights-node@1.0.0

## 0.6.3

### Patch Changes

- Updated dependencies [1d33996]
  - @backstage-community/plugin-tech-insights-common@0.2.18
  - @backstage-community/plugin-tech-insights-node@0.6.7

## 0.6.2

### Patch Changes

- Updated dependencies [a84eb44]
  - @backstage-community/plugin-tech-insights-common@0.2.17
  - @backstage-community/plugin-tech-insights-node@0.6.6

## 0.6.1

### Patch Changes

- ae2ee8a: Updated dependency `@types/supertest` to `^6.0.0`.
  Updated dependency `supertest` to `^7.0.0`.
- 00d148d: Backstage version bump to v1.30.2
- Updated dependencies [00d148d]
  - @backstage-community/plugin-tech-insights-common@0.2.16
  - @backstage-community/plugin-tech-insights-node@0.6.5

## 0.6.0

### Minor Changes

- e49b4eb: Remove dependency to `backend-test-utils` in none test code.

  **BREAKING**: From now on the `logger` must be provided, when using `initializePersistenceContext`.

## 0.5.35

### Patch Changes

- 7ac338c: Update Backstage to 1.29.1
  Remove usage of deprecated API endpoints except tokenManager
- a8d8d44: Introduce a concurrency limit for running checks in parallel to avoid limits like the DB connection pool.
- 794cc8b: Fix api reports generated with the wrong name
  Update @backstage/cli to 0.26.11
  Add missing Backstage fields in `package.json`
- Updated dependencies [7ac338c]
- Updated dependencies [794cc8b]
  - @backstage-community/plugin-tech-insights-node@0.6.4
  - @backstage-community/plugin-tech-insights-common@0.2.15

## 0.5.34

### Patch Changes

- cbad35a: Updated dependencies.
- Updated dependencies [cbad35a]
  - @backstage-community/plugin-tech-insights-common@0.2.14
  - @backstage-community/plugin-tech-insights-node@0.6.3

## 0.5.33

### Patch Changes

- d4a8be1: Provide an overview page about checks for entities.
- Updated dependencies [d4a8be1]
  - @backstage-community/plugin-tech-insights-node@0.6.2

## 0.5.32

### Patch Changes

- 193a2a3: Migrated from the [backstage/backstage](https://github.com/backstage/backstage) monorepo.
- Updated dependencies [193a2a3]
  - @backstage-community/plugin-tech-insights-common@0.2.13
  - @backstage-community/plugin-tech-insights-node@0.6.1

## 0.5.31

### Patch Changes

- d5a1fe1: Replaced winston logger with `LoggerService`
- Updated dependencies
  - @backstage/backend-common@0.21.7
  - @backstage-community/plugin-tech-insights-node@0.6.0
  - @backstage/backend-plugin-api@0.6.17
  - @backstage/backend-tasks@0.5.22
  - @backstage/catalog-client@1.6.4
  - @backstage/catalog-model@1.4.5
  - @backstage/config@1.2.0
  - @backstage/errors@1.2.4
  - @backstage/types@1.1.1
  - @backstage-community/plugin-tech-insights-common@0.2.12

## 0.5.31-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.21.7-next.1
  - @backstage/backend-plugin-api@0.6.17-next.1
  - @backstage/catalog-client@1.6.4-next.0
  - @backstage/backend-tasks@0.5.22-next.1
  - @backstage-community/plugin-tech-insights-node@0.5.3-next.1
  - @backstage/catalog-model@1.4.5
  - @backstage/config@1.2.0
  - @backstage/errors@1.2.4
  - @backstage/types@1.1.1
  - @backstage-community/plugin-tech-insights-common@0.2.12

## 0.5.31-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.21.7-next.0
  - @backstage/backend-plugin-api@0.6.17-next.0
  - @backstage/backend-tasks@0.5.22-next.0
  - @backstage/catalog-client@1.6.3
  - @backstage/catalog-model@1.4.5
  - @backstage/config@1.2.0
  - @backstage/errors@1.2.4
  - @backstage/types@1.1.1
  - @backstage-community/plugin-tech-insights-common@0.2.12
  - @backstage-community/plugin-tech-insights-node@0.5.3-next.0

## 0.5.30

### Patch Changes

- Updated dependencies
  - @backstage/catalog-client@1.6.3
  - @backstage/backend-common@0.21.6
  - @backstage/backend-plugin-api@0.6.16
  - @backstage/backend-tasks@0.5.21
  - @backstage-community/plugin-tech-insights-node@0.5.2
  - @backstage/catalog-model@1.4.5
  - @backstage/config@1.2.0
  - @backstage/errors@1.2.4
  - @backstage/types@1.1.1
  - @backstage-community/plugin-tech-insights-common@0.2.12

## 0.5.29

### Patch Changes

- Updated dependencies
  - @backstage/catalog-client@1.6.2
  - @backstage/backend-common@0.21.5
  - @backstage/backend-tasks@0.5.20
  - @backstage-community/plugin-tech-insights-node@0.5.1
  - @backstage/backend-plugin-api@0.6.15
  - @backstage/catalog-model@1.4.5
  - @backstage/config@1.2.0
  - @backstage/errors@1.2.4
  - @backstage/types@1.1.1
  - @backstage-community/plugin-tech-insights-common@0.2.12

## 0.5.28

### Patch Changes

- 0fb419b: Updated dependency `uuid` to `^9.0.0`.
  Updated dependency `@types/uuid` to `^9.0.0`.
- d621468: Added support for the new `AuthService`.
- Updated dependencies
  - @backstage/backend-common@0.21.4
  - @backstage/config@1.2.0
  - @backstage/errors@1.2.4
  - @backstage/backend-plugin-api@0.6.14
  - @backstage/catalog-client@1.6.1
  - @backstage/backend-tasks@0.5.19
  - @backstage-community/plugin-tech-insights-node@0.5.0
  - @backstage/catalog-model@1.4.5
  - @backstage/types@1.1.1
  - @backstage-community/plugin-tech-insights-common@0.2.12

## 0.5.28-next.2

### Patch Changes

- Updated dependencies
  - @backstage/catalog-client@1.6.1-next.1
  - @backstage/backend-common@0.21.4-next.2
  - @backstage/backend-plugin-api@0.6.14-next.2
  - @backstage/backend-tasks@0.5.19-next.2
  - @backstage/catalog-model@1.4.5-next.0
  - @backstage/config@1.2.0-next.1
  - @backstage/errors@1.2.4-next.0
  - @backstage/types@1.1.1
  - @backstage-community/plugin-tech-insights-common@0.2.12
  - @backstage-community/plugin-tech-insights-node@0.5.0-next.2

## 0.5.28-next.1

### Patch Changes

- Updated dependencies
  - @backstage/config@1.2.0-next.1
  - @backstage/backend-common@0.21.4-next.1
  - @backstage/backend-plugin-api@0.6.14-next.1
  - @backstage/backend-tasks@0.5.19-next.1
  - @backstage-community/plugin-tech-insights-node@0.5.0-next.1
  - @backstage/catalog-client@1.6.1-next.0
  - @backstage/catalog-model@1.4.5-next.0
  - @backstage/errors@1.2.4-next.0
  - @backstage/types@1.1.1
  - @backstage-community/plugin-tech-insights-common@0.2.12

## 0.5.27-next.0

### Patch Changes

- 0fb419b: Updated dependency `uuid` to `^9.0.0`.
  Updated dependency `@types/uuid` to `^9.0.0`.
- d621468: Added support for the new `AuthService`.
- Updated dependencies
  - @backstage/backend-common@0.21.3-next.0
  - @backstage/errors@1.2.4-next.0
  - @backstage/backend-plugin-api@0.6.13-next.0
  - @backstage/backend-tasks@0.5.18-next.0
  - @backstage-community/plugin-tech-insights-node@0.5.0-next.0
  - @backstage/catalog-client@1.6.1-next.0
  - @backstage/catalog-model@1.4.5-next.0
  - @backstage/config@1.1.2-next.0
  - @backstage/types@1.1.1
  - @backstage-community/plugin-tech-insights-common@0.2.12

## 0.5.24

### Patch Changes

- 7201af3: Add support for the new backend system.

  A new backend plugin for the tech-insights backend
  was added and exported as `default`.

  You can use it with the new backend system like

  ```ts title="packages/backend/src/index.ts"
  backend.add(import('@backstage-community/plugin-tech-insights-backend'));
  ```

- 9aac2b0: Use `--cwd` as the first `yarn` argument
- 341c2a2: Move `FactRetrieverRegistry` and `PersistenceContext` to `@backstage-community/plugin-tech-insights-node`.

  Original exports are marked as deprecated and re-export the moved types.

  Please replace uses like

  ```ts
  import {
    FactRetrieverRegistry,
    PersistenceContext,
  } from '@backstage-community/plugin-tech-insights-backend';
  ```

  with

  ```ts
  import {
    FactRetrieverRegistry,
    PersistenceContext,
  } from '@backstage-community/plugin-tech-insights-node';
  ```

- Updated dependencies
  - @backstage/backend-common@0.21.0
  - @backstage-community/plugin-tech-insights-node@0.4.16
  - @backstage/backend-plugin-api@0.6.10
  - @backstage/backend-tasks@0.5.15
  - @backstage/catalog-model@1.4.4
  - @backstage/catalog-client@1.6.0
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3
  - @backstage/types@1.1.1
  - @backstage-community/plugin-tech-insights-common@0.2.12

## 0.5.24-next.3

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.21.0-next.3
  - @backstage/backend-tasks@0.5.15-next.3
  - @backstage-community/plugin-tech-insights-node@0.4.16-next.3
  - @backstage/backend-plugin-api@0.6.10-next.3
  - @backstage/catalog-client@1.6.0-next.1
  - @backstage/catalog-model@1.4.4-next.0
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3
  - @backstage/types@1.1.1
  - @backstage-community/plugin-tech-insights-common@0.2.12

## 0.5.24-next.2

### Patch Changes

- 7201af3: Add support for the new backend system.

  A new backend plugin for the tech-insights backend
  was added and exported as `default`.

  You can use it with the new backend system like

  ```ts title="packages/backend/src/index.ts"
  backend.add(import('@backstage-community/plugin-tech-insights-backend'));
  ```

- 9aac2b0: Use `--cwd` as the first `yarn` argument
- 341c2a2: Move `FactRetrieverRegistry` and `PersistenceContext` to `@backstage-community/plugin-tech-insights-node`.

  Original exports are marked as deprecated and re-export the moved types.

  Please replace uses like

  ```ts
  import {
    FactRetrieverRegistry,
    PersistenceContext,
  } from '@backstage-community/plugin-tech-insights-backend';
  ```

  with

  ```ts
  import {
    FactRetrieverRegistry,
    PersistenceContext,
  } from '@backstage-community/plugin-tech-insights-node';
  ```

- Updated dependencies
  - @backstage/backend-common@0.21.0-next.2
  - @backstage-community/plugin-tech-insights-node@0.4.16-next.2
  - @backstage/backend-plugin-api@0.6.10-next.2
  - @backstage/backend-tasks@0.5.15-next.2
  - @backstage/config@1.1.1
  - @backstage/catalog-client@1.6.0-next.1
  - @backstage/catalog-model@1.4.4-next.0
  - @backstage/errors@1.2.3
  - @backstage/types@1.1.1
  - @backstage-community/plugin-tech-insights-common@0.2.12

## 0.5.24-next.1

### Patch Changes

- Updated dependencies
  - @backstage/catalog-model@1.4.4-next.0
  - @backstage/catalog-client@1.6.0-next.1
  - @backstage/backend-common@0.21.0-next.1
  - @backstage/backend-tasks@0.5.15-next.1
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3
  - @backstage/types@1.1.1
  - @backstage-community/plugin-tech-insights-common@0.2.12
  - @backstage-community/plugin-tech-insights-node@0.4.16-next.1

## 0.5.24-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.21.0-next.0
  - @backstage/catalog-client@1.6.0-next.0
  - @backstage/backend-tasks@0.5.15-next.0
  - @backstage-community/plugin-tech-insights-node@0.4.16-next.0
  - @backstage/catalog-model@1.4.3
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3
  - @backstage/types@1.1.1
  - @backstage-community/plugin-tech-insights-common@0.2.12

## 0.5.23

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.20.1
  - @backstage/catalog-client@1.5.2
  - @backstage-community/plugin-tech-insights-node@0.4.15
  - @backstage/backend-tasks@0.5.14
  - @backstage/catalog-model@1.4.3
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3
  - @backstage/types@1.1.1
  - @backstage-community/plugin-tech-insights-common@0.2.12

## 0.5.23-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.20.1-next.2
  - @backstage/backend-tasks@0.5.14-next.2
  - @backstage-community/plugin-tech-insights-node@0.4.15-next.2

## 0.5.23-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.20.1-next.1
  - @backstage/config@1.1.1
  - @backstage/backend-tasks@0.5.14-next.1
  - @backstage-community/plugin-tech-insights-node@0.4.15-next.1
  - @backstage/catalog-client@1.5.2-next.0
  - @backstage/catalog-model@1.4.3
  - @backstage/errors@1.2.3
  - @backstage/types@1.1.1
  - @backstage-community/plugin-tech-insights-common@0.2.12

## 0.5.23-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.20.1-next.0
  - @backstage/catalog-client@1.5.2-next.0
  - @backstage-community/plugin-tech-insights-node@0.4.15-next.0
  - @backstage/backend-tasks@0.5.14-next.0
  - @backstage/catalog-model@1.4.3
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3
  - @backstage/types@1.1.1
  - @backstage-community/plugin-tech-insights-common@0.2.12

## 0.5.22

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.20.0
  - @backstage/catalog-client@1.5.0
  - @backstage/backend-tasks@0.5.13
  - @backstage-community/plugin-tech-insights-node@0.4.14
  - @backstage/catalog-model@1.4.3
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3
  - @backstage/types@1.1.1
  - @backstage-community/plugin-tech-insights-common@0.2.12

## 0.5.22-next.3

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.20.0-next.3
  - @backstage/backend-tasks@0.5.13-next.3
  - @backstage/catalog-client@1.5.0-next.1
  - @backstage/catalog-model@1.4.3
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3
  - @backstage/types@1.1.1
  - @backstage-community/plugin-tech-insights-common@0.2.12
  - @backstage-community/plugin-tech-insights-node@0.4.14-next.3

## 0.5.22-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.20.0-next.2
  - @backstage/catalog-client@1.5.0-next.1
  - @backstage/backend-tasks@0.5.13-next.2
  - @backstage/catalog-model@1.4.3
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3
  - @backstage/types@1.1.1
  - @backstage-community/plugin-tech-insights-common@0.2.12
  - @backstage-community/plugin-tech-insights-node@0.4.14-next.2

## 0.5.22-next.1

### Patch Changes

- Updated dependencies
  - @backstage/catalog-client@1.5.0-next.0
  - @backstage/backend-common@0.20.0-next.1
  - @backstage/backend-tasks@0.5.13-next.1
  - @backstage/catalog-model@1.4.3
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3
  - @backstage/types@1.1.1
  - @backstage-community/plugin-tech-insights-common@0.2.12
  - @backstage-community/plugin-tech-insights-node@0.4.14-next.1

## 0.5.22-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.20.0-next.0
  - @backstage/backend-tasks@0.5.13-next.0
  - @backstage-community/plugin-tech-insights-node@0.4.14-next.0
  - @backstage/catalog-client@1.4.6
  - @backstage/catalog-model@1.4.3
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3
  - @backstage/types@1.1.1
  - @backstage-community/plugin-tech-insights-common@0.2.12

## 0.5.21

### Patch Changes

- 013611b42e: `knex` has been bumped to major version 3 and `better-sqlite3` to major version 9, which deprecate node 16 support.
- 193ad022bb: Add `factRetrieverId` to the fact retriever's logger metadata.
- Updated dependencies
  - @backstage/backend-common@0.19.9
  - @backstage/backend-tasks@0.5.12
  - @backstage/catalog-client@1.4.6
  - @backstage/catalog-model@1.4.3
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3
  - @backstage/types@1.1.1
  - @backstage-community/plugin-tech-insights-common@0.2.12
  - @backstage-community/plugin-tech-insights-node@0.4.13

## 0.5.21-next.2

### Patch Changes

- [#20570](https://github.com/backstage/backstage/pull/20570) [`013611b42e`](https://github.com/backstage/backstage/commit/013611b42ed457fefa9bb85fddf416cf5e0c1f76) Thanks [@freben](https://github.com/freben)! - `knex` has been bumped to major version 3 and `better-sqlite3` to major version 9, which deprecate node 16 support.

- Updated dependencies
  - @backstage/backend-common@0.19.9-next.2
  - @backstage/backend-tasks@0.5.12-next.2
  - @backstage-community/plugin-tech-insights-node@0.4.13-next.2

## 0.5.21-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.9-next.1
  - @backstage/backend-tasks@0.5.12-next.1
  - @backstage-community/plugin-tech-insights-node@0.4.13-next.1
  - @backstage/catalog-client@1.4.5
  - @backstage/catalog-model@1.4.3
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3
  - @backstage/types@1.1.1
  - @backstage-community/plugin-tech-insights-common@0.2.12

## 0.5.21-next.0

### Patch Changes

- 193ad022bb: Add `factRetrieverId` to the fact retriever's logger metadata.
- Updated dependencies
  - @backstage/backend-common@0.19.9-next.0
  - @backstage/backend-tasks@0.5.12-next.0
  - @backstage/catalog-client@1.4.5
  - @backstage/catalog-model@1.4.3
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3
  - @backstage/types@1.1.1
  - @backstage-community/plugin-tech-insights-common@0.2.12
  - @backstage-community/plugin-tech-insights-node@0.4.13-next.0

## 0.5.20

### Patch Changes

- cc7dddfa7f: Increase the maximum allowed length of an entity filter for tech insights fact schemas.
- Updated dependencies
  - @backstage/backend-tasks@0.5.11
  - @backstage/backend-common@0.19.8
  - @backstage/catalog-model@1.4.3
  - @backstage/errors@1.2.3
  - @backstage-community/plugin-tech-insights-node@0.4.12
  - @backstage/catalog-client@1.4.5
  - @backstage/config@1.1.1
  - @backstage/types@1.1.1
  - @backstage-community/plugin-tech-insights-common@0.2.12

## 0.5.20-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.8-next.2
  - @backstage/catalog-model@1.4.3-next.0
  - @backstage/errors@1.2.3-next.0
  - @backstage/backend-tasks@0.5.11-next.2
  - @backstage-community/plugin-tech-insights-node@0.4.12-next.2
  - @backstage/catalog-client@1.4.5-next.0
  - @backstage/config@1.1.1-next.0
  - @backstage/types@1.1.1
  - @backstage-community/plugin-tech-insights-common@0.2.12

## 0.5.19-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-tasks@0.5.10-next.1
  - @backstage/backend-common@0.19.7-next.1
  - @backstage-community/plugin-tech-insights-node@0.4.11-next.1
  - @backstage/config@1.1.0
  - @backstage/catalog-client@1.4.4
  - @backstage/catalog-model@1.4.2
  - @backstage/errors@1.2.2
  - @backstage/types@1.1.1
  - @backstage-community/plugin-tech-insights-common@0.2.12

## 0.5.19-next.0

### Patch Changes

- cc7dddfa7f: Increase the maximum allowed length of an entity filter for tech insights fact schemas.
- Updated dependencies
  - @backstage/backend-common@0.19.7-next.0
  - @backstage/config@1.1.0
  - @backstage/backend-tasks@0.5.10-next.0
  - @backstage/catalog-client@1.4.4
  - @backstage/catalog-model@1.4.2
  - @backstage/errors@1.2.2
  - @backstage/types@1.1.1
  - @backstage-community/plugin-tech-insights-common@0.2.12
  - @backstage-community/plugin-tech-insights-node@0.4.11-next.0

## 0.5.17

### Patch Changes

- cfc3ca6ce060: Changes needed to support MySQL
- 814feeed7343: Update to handle invalid luxon values
- Updated dependencies
  - @backstage/backend-tasks@0.5.8
  - @backstage/backend-common@0.19.5
  - @backstage/config@1.1.0
  - @backstage/catalog-client@1.4.4
  - @backstage/catalog-model@1.4.2
  - @backstage/errors@1.2.2
  - @backstage-community/plugin-tech-insights-common@0.2.12
  - @backstage/types@1.1.1
  - @backstage-community/plugin-tech-insights-node@0.4.9

## 0.5.17-next.3

### Patch Changes

- Updated dependencies
  - @backstage/catalog-client@1.4.4-next.2
  - @backstage/catalog-model@1.4.2-next.2
  - @backstage/config@1.1.0-next.2
  - @backstage/errors@1.2.2-next.0
  - @backstage-community/plugin-tech-insights-common@0.2.12-next.0
  - @backstage/types@1.1.1-next.0
  - @backstage/backend-common@0.19.5-next.3
  - @backstage/backend-tasks@0.5.8-next.3
  - @backstage-community/plugin-tech-insights-node@0.4.9-next.3

## 0.5.17-next.2

### Patch Changes

- 814feeed7343: Update to handle invalid luxon values
- Updated dependencies
  - @backstage/config@1.1.0-next.1
  - @backstage/backend-tasks@0.5.8-next.2
  - @backstage/backend-common@0.19.5-next.2
  - @backstage/catalog-model@1.4.2-next.1
  - @backstage-community/plugin-tech-insights-node@0.4.9-next.2
  - @backstage/catalog-client@1.4.4-next.1
  - @backstage/errors@1.2.1
  - @backstage/types@1.1.0
  - @backstage-community/plugin-tech-insights-common@0.2.11

## 0.5.17-next.1

### Patch Changes

- Updated dependencies
  - @backstage/config@1.1.0-next.0
  - @backstage/backend-tasks@0.5.8-next.1
  - @backstage/backend-common@0.19.5-next.1
  - @backstage/catalog-model@1.4.2-next.0
  - @backstage-community/plugin-tech-insights-node@0.4.9-next.1
  - @backstage/catalog-client@1.4.4-next.0
  - @backstage/errors@1.2.1
  - @backstage/types@1.1.0
  - @backstage-community/plugin-tech-insights-common@0.2.11

## 0.5.16-next.0

### Patch Changes

- cfc3ca6ce060: Changes needed to support MySQL
- Updated dependencies
  - @backstage/backend-common@0.19.4-next.0
  - @backstage/backend-tasks@0.5.7-next.0
  - @backstage/catalog-client@1.4.3
  - @backstage/catalog-model@1.4.1
  - @backstage/config@1.0.8
  - @backstage/errors@1.2.1
  - @backstage/types@1.1.0
  - @backstage-community/plugin-tech-insights-common@0.2.11
  - @backstage-community/plugin-tech-insights-node@0.4.8-next.0

## 0.5.14

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.2
  - @backstage/backend-tasks@0.5.5
  - @backstage-community/plugin-tech-insights-node@0.4.6
  - @backstage/catalog-client@1.4.3
  - @backstage/catalog-model@1.4.1
  - @backstage/config@1.0.8
  - @backstage/errors@1.2.1
  - @backstage/types@1.1.0
  - @backstage-community/plugin-tech-insights-common@0.2.11

## 0.5.14-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-tasks@0.5.5-next.2
  - @backstage/backend-common@0.19.2-next.2
  - @backstage-community/plugin-tech-insights-node@0.4.6-next.2

## 0.5.14-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.2-next.1
  - @backstage/backend-tasks@0.5.5-next.1
  - @backstage-community/plugin-tech-insights-node@0.4.6-next.1
  - @backstage/catalog-client@1.4.3
  - @backstage/catalog-model@1.4.1
  - @backstage/config@1.0.8
  - @backstage/errors@1.2.1
  - @backstage/types@1.1.0
  - @backstage-community/plugin-tech-insights-common@0.2.11

## 0.5.14-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.2-next.0
  - @backstage/backend-tasks@0.5.5-next.0
  - @backstage/catalog-client@1.4.3
  - @backstage/catalog-model@1.4.1
  - @backstage/config@1.0.8
  - @backstage/errors@1.2.1
  - @backstage/types@1.1.0
  - @backstage-community/plugin-tech-insights-common@0.2.11
  - @backstage-community/plugin-tech-insights-node@0.4.6-next.0

## 0.5.13

### Patch Changes

- 4edd1ef71453: semver upgrade to 7.5.3
- Updated dependencies
  - @backstage/errors@1.2.1
  - @backstage/backend-common@0.19.1
  - @backstage/backend-tasks@0.5.4
  - @backstage/catalog-client@1.4.3
  - @backstage/catalog-model@1.4.1
  - @backstage/config@1.0.8
  - @backstage/types@1.1.0
  - @backstage-community/plugin-tech-insights-common@0.2.11
  - @backstage-community/plugin-tech-insights-node@0.4.5

## 0.5.13-next.1

### Patch Changes

- 4edd1ef71453: semver upgrade to 7.5.3
- Updated dependencies
  - @backstage/backend-common@0.19.1-next.0
  - @backstage/backend-tasks@0.5.4-next.0
  - @backstage/catalog-client@1.4.3-next.0
  - @backstage/catalog-model@1.4.1-next.0
  - @backstage/config@1.0.8
  - @backstage/errors@1.2.1-next.0
  - @backstage/types@1.1.0
  - @backstage-community/plugin-tech-insights-common@0.2.11
  - @backstage-community/plugin-tech-insights-node@0.4.5-next.0

## 0.5.13-next.0

### Patch Changes

- Updated dependencies
  - @backstage/errors@1.2.1-next.0
  - @backstage/backend-common@0.19.1-next.0
  - @backstage/backend-tasks@0.5.4-next.0
  - @backstage/catalog-client@1.4.3-next.0
  - @backstage/catalog-model@1.4.1-next.0
  - @backstage/config@1.0.8
  - @backstage/types@1.1.0
  - @backstage-community/plugin-tech-insights-common@0.2.11
  - @backstage-community/plugin-tech-insights-node@0.4.5-next.0

## 0.5.12

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.0
  - @backstage/catalog-client@1.4.2
  - @backstage/types@1.1.0
  - @backstage/catalog-model@1.4.0
  - @backstage/errors@1.2.0
  - @backstage/backend-tasks@0.5.3
  - @backstage-community/plugin-tech-insights-node@0.4.4
  - @backstage/config@1.0.8
  - @backstage-community/plugin-tech-insights-common@0.2.11

## 0.5.12-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.0-next.2
  - @backstage/catalog-model@1.4.0-next.1
  - @backstage/backend-tasks@0.5.3-next.2
  - @backstage/catalog-client@1.4.2-next.2
  - @backstage/config@1.0.7
  - @backstage/errors@1.2.0-next.0
  - @backstage/types@1.0.2
  - @backstage-community/plugin-tech-insights-common@0.2.10
  - @backstage-community/plugin-tech-insights-node@0.4.4-next.2

## 0.5.12-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.0-next.1
  - @backstage/errors@1.2.0-next.0
  - @backstage/catalog-model@1.4.0-next.0
  - @backstage/backend-tasks@0.5.3-next.1
  - @backstage-community/plugin-tech-insights-node@0.4.4-next.1
  - @backstage/catalog-client@1.4.2-next.1
  - @backstage/config@1.0.7
  - @backstage/types@1.0.2
  - @backstage-community/plugin-tech-insights-common@0.2.10

## 0.5.12-next.0

### Patch Changes

- Updated dependencies
  - @backstage/catalog-client@1.4.2-next.0
  - @backstage/backend-common@0.18.6-next.0
  - @backstage/config@1.0.7
  - @backstage/backend-tasks@0.5.3-next.0
  - @backstage/catalog-model@1.3.0
  - @backstage/errors@1.1.5
  - @backstage/types@1.0.2
  - @backstage-community/plugin-tech-insights-common@0.2.10
  - @backstage-community/plugin-tech-insights-node@0.4.4-next.0

## 0.5.11

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.5
  - @backstage/backend-tasks@0.5.2
  - @backstage-community/plugin-tech-insights-node@0.4.3
  - @backstage/catalog-client@1.4.1
  - @backstage/catalog-model@1.3.0
  - @backstage/config@1.0.7
  - @backstage/errors@1.1.5
  - @backstage/types@1.0.2
  - @backstage-community/plugin-tech-insights-common@0.2.10

## 0.5.11-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.5-next.1
  - @backstage/backend-tasks@0.5.2-next.1
  - @backstage-community/plugin-tech-insights-node@0.4.3-next.1
  - @backstage/config@1.0.7

## 0.5.11-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.5-next.0
  - @backstage/backend-tasks@0.5.2-next.0
  - @backstage-community/plugin-tech-insights-node@0.4.3-next.0
  - @backstage/catalog-client@1.4.1
  - @backstage/catalog-model@1.3.0
  - @backstage/config@1.0.7
  - @backstage/errors@1.1.5
  - @backstage/types@1.0.2
  - @backstage-community/plugin-tech-insights-common@0.2.10

## 0.5.10

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.4
  - @backstage/catalog-client@1.4.1
  - @backstage/backend-tasks@0.5.1
  - @backstage/catalog-model@1.3.0
  - @backstage-community/plugin-tech-insights-node@0.4.2
  - @backstage/config@1.0.7
  - @backstage/errors@1.1.5
  - @backstage/types@1.0.2
  - @backstage-community/plugin-tech-insights-common@0.2.10

## 0.5.10-next.3

### Patch Changes

- Updated dependencies
  - @backstage/catalog-model@1.3.0-next.0
  - @backstage/backend-common@0.18.4-next.2
  - @backstage/backend-tasks@0.5.1-next.2
  - @backstage/catalog-client@1.4.1-next.1
  - @backstage/config@1.0.7
  - @backstage/errors@1.1.5
  - @backstage/types@1.0.2
  - @backstage-community/plugin-tech-insights-common@0.2.10
  - @backstage-community/plugin-tech-insights-node@0.4.2-next.2

## 0.5.10-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.4-next.2
  - @backstage/catalog-client@1.4.1-next.0
  - @backstage/backend-tasks@0.5.1-next.2
  - @backstage/catalog-model@1.2.1
  - @backstage/config@1.0.7
  - @backstage/errors@1.1.5
  - @backstage/types@1.0.2
  - @backstage-community/plugin-tech-insights-common@0.2.10
  - @backstage-community/plugin-tech-insights-node@0.4.2-next.2

## 0.5.10-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-tasks@0.5.1-next.1
  - @backstage/backend-common@0.18.4-next.1
  - @backstage/catalog-client@1.4.0
  - @backstage/catalog-model@1.2.1
  - @backstage/config@1.0.7
  - @backstage/errors@1.1.5
  - @backstage/types@1.0.2
  - @backstage-community/plugin-tech-insights-common@0.2.10
  - @backstage-community/plugin-tech-insights-node@0.4.2-next.1

## 0.5.10-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.4-next.0
  - @backstage/config@1.0.7
  - @backstage/backend-tasks@0.5.1-next.0
  - @backstage/catalog-client@1.4.0
  - @backstage/catalog-model@1.2.1
  - @backstage/errors@1.1.5
  - @backstage/types@1.0.2
  - @backstage-community/plugin-tech-insights-common@0.2.10
  - @backstage-community/plugin-tech-insights-node@0.4.2-next.0

## 0.5.9

### Patch Changes

- f244b589163: Add DB index to improve latency of latest fact query
- Updated dependencies
  - @backstage/catalog-client@1.4.0
  - @backstage/backend-tasks@0.5.0
  - @backstage/backend-common@0.18.3
  - @backstage/errors@1.1.5
  - @backstage/catalog-model@1.2.1
  - @backstage/config@1.0.7
  - @backstage/types@1.0.2
  - @backstage-community/plugin-tech-insights-common@0.2.10
  - @backstage-community/plugin-tech-insights-node@0.4.1

## 0.5.9-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-tasks@0.5.0-next.2
  - @backstage/backend-common@0.18.3-next.2
  - @backstage-community/plugin-tech-insights-node@0.4.1-next.2
  - @backstage/config@1.0.7-next.0

## 0.5.9-next.1

### Patch Changes

- Updated dependencies
  - @backstage/errors@1.1.5-next.0
  - @backstage/backend-common@0.18.3-next.1
  - @backstage/catalog-client@1.4.0-next.1
  - @backstage/backend-tasks@0.4.4-next.1
  - @backstage/config@1.0.7-next.0
  - @backstage/catalog-model@1.2.1-next.1
  - @backstage/types@1.0.2
  - @backstage-community/plugin-tech-insights-common@0.2.10
  - @backstage-community/plugin-tech-insights-node@0.4.1-next.1

## 0.5.9-next.0

### Patch Changes

- f244b58916: Add DB index to improve latency of latest fact query
- Updated dependencies
  - @backstage/catalog-client@1.4.0-next.0
  - @backstage/backend-tasks@0.4.4-next.0
  - @backstage/backend-common@0.18.3-next.0
  - @backstage/catalog-model@1.2.1-next.0
  - @backstage/config@1.0.6
  - @backstage/errors@1.1.4
  - @backstage/types@1.0.2
  - @backstage-community/plugin-tech-insights-common@0.2.10
  - @backstage-community/plugin-tech-insights-node@0.4.1-next.0

## 0.5.8

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
  - @backstage/backend-common@0.18.2
  - @backstage-community/plugin-tech-insights-common@0.2.10
  - @backstage-community/plugin-tech-insights-node@0.4.0
  - @backstage/catalog-model@1.2.0
  - @backstage/backend-tasks@0.4.3
  - @backstage/catalog-client@1.3.1
  - @backstage/config@1.0.6
  - @backstage/errors@1.1.4
  - @backstage/types@1.0.2

## 0.5.8-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.2-next.2
  - @backstage/catalog-model@1.2.0-next.1
  - @backstage/backend-tasks@0.4.3-next.2
  - @backstage/catalog-client@1.3.1-next.1
  - @backstage/config@1.0.6
  - @backstage/errors@1.1.4
  - @backstage/types@1.0.2
  - @backstage-community/plugin-tech-insights-common@0.2.10-next.0
  - @backstage-community/plugin-tech-insights-node@0.4.0-next.2

## 0.5.8-next.1

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
  - @backstage-community/plugin-tech-insights-common@0.2.10-next.0
  - @backstage-community/plugin-tech-insights-node@0.4.0-next.1
  - @backstage/backend-common@0.18.2-next.1
  - @backstage/backend-tasks@0.4.3-next.1
  - @backstage/catalog-client@1.3.1-next.0
  - @backstage/catalog-model@1.1.6-next.0
  - @backstage/config@1.0.6
  - @backstage/errors@1.1.4
  - @backstage/types@1.0.2

## 0.5.8-next.0

### Patch Changes

- Updated dependencies
  - @backstage/catalog-model@1.1.6-next.0
  - @backstage/backend-common@0.18.2-next.0
  - @backstage/catalog-client@1.3.1-next.0
  - @backstage/backend-tasks@0.4.3-next.0
  - @backstage-community/plugin-tech-insights-node@0.3.10-next.0

## 0.5.6

### Patch Changes

- 7a38a31699: Complete check results run when a single check errors so that we don't block other checks from working due to an error in a single check
- 44c18b4d3f: Expose optional `persistenceContext` on `TechInsights` construction to enable integrators to provide their own database implementations for fact handling.
- b48317cfc6: Modifies database cleanup to remove all facts for entities instead of hand-picked ones only. Improves query execution a lot in large datasets.
  Changes semantics of the lifecycle deletion logic slightly for cases were historical entities/facts, that are , not present in the application anymore, were kept forever instead of being cleaned up. The new implementation is more along the expected lines.
- Updated dependencies
  - @backstage/backend-common@0.18.0
  - @backstage/catalog-model@1.1.5
  - @backstage/catalog-client@1.3.0
  - @backstage/backend-tasks@0.4.1
  - @backstage/config@1.0.6
  - @backstage/errors@1.1.4
  - @backstage/types@1.0.2
  - @backstage-community/plugin-tech-insights-common@0.2.9
  - @backstage-community/plugin-tech-insights-node@0.3.8

## 0.5.6-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.0-next.1
  - @backstage/backend-tasks@0.4.1-next.1
  - @backstage/catalog-client@1.3.0-next.2
  - @backstage-community/plugin-tech-insights-node@0.3.8-next.1
  - @backstage/catalog-model@1.1.5-next.1
  - @backstage/config@1.0.6-next.0
  - @backstage/errors@1.1.4
  - @backstage/types@1.0.2
  - @backstage-community/plugin-tech-insights-common@0.2.9

## 0.5.6-next.1

### Patch Changes

- 7a38a31699: Complete check results run when a single check errors so that we don't block other checks from working due to an error in a single check
- Updated dependencies
  - @backstage/backend-common@0.18.0-next.0
  - @backstage/config@1.0.6-next.0
  - @backstage/backend-tasks@0.4.1-next.0
  - @backstage/catalog-client@1.3.0-next.1
  - @backstage/catalog-model@1.1.5-next.1
  - @backstage/errors@1.1.4
  - @backstage/types@1.0.2
  - @backstage-community/plugin-tech-insights-common@0.2.9
  - @backstage-community/plugin-tech-insights-node@0.3.8-next.0

## 0.5.6-next.0

### Patch Changes

- Updated dependencies
  - @backstage/catalog-model@1.1.5-next.0
  - @backstage/catalog-client@1.3.0-next.0
  - @backstage/backend-common@0.17.0
  - @backstage/backend-tasks@0.4.0
  - @backstage/config@1.0.5
  - @backstage/errors@1.1.4
  - @backstage/types@1.0.2
  - @backstage-community/plugin-tech-insights-common@0.2.9
  - @backstage-community/plugin-tech-insights-node@0.3.7

## 0.5.5

### Patch Changes

- Updated dependencies
  - @backstage/catalog-client@1.2.0
  - @backstage/backend-common@0.17.0
  - @backstage/backend-tasks@0.4.0
  - @backstage/errors@1.1.4
  - @backstage/types@1.0.2
  - @backstage/catalog-model@1.1.4
  - @backstage/config@1.0.5
  - @backstage-community/plugin-tech-insights-common@0.2.9
  - @backstage-community/plugin-tech-insights-node@0.3.7

## 0.5.5-next.3

### Patch Changes

- Updated dependencies
  - @backstage/backend-tasks@0.4.0-next.3
  - @backstage/backend-common@0.17.0-next.3
  - @backstage/catalog-client@1.2.0-next.1
  - @backstage/catalog-model@1.1.4-next.1
  - @backstage/config@1.0.5-next.1
  - @backstage/errors@1.1.4-next.1
  - @backstage/types@1.0.2-next.1
  - @backstage-community/plugin-tech-insights-common@0.2.9-next.1
  - @backstage-community/plugin-tech-insights-node@0.3.7-next.3

## 0.5.5-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.17.0-next.2
  - @backstage/backend-tasks@0.4.0-next.2
  - @backstage-community/plugin-tech-insights-node@0.3.7-next.2
  - @backstage/catalog-client@1.2.0-next.1
  - @backstage/catalog-model@1.1.4-next.1
  - @backstage/config@1.0.5-next.1
  - @backstage/errors@1.1.4-next.1
  - @backstage/types@1.0.2-next.1
  - @backstage-community/plugin-tech-insights-common@0.2.9-next.1

## 0.5.5-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.17.0-next.1
  - @backstage/backend-tasks@0.4.0-next.1
  - @backstage/types@1.0.2-next.1
  - @backstage-community/plugin-tech-insights-node@0.3.7-next.1
  - @backstage/config@1.0.5-next.1
  - @backstage/catalog-client@1.2.0-next.1
  - @backstage/catalog-model@1.1.4-next.1
  - @backstage/errors@1.1.4-next.1
  - @backstage-community/plugin-tech-insights-common@0.2.9-next.1

## 0.5.5-next.0

### Patch Changes

- Updated dependencies
  - @backstage/catalog-client@1.2.0-next.0
  - @backstage/backend-common@0.16.1-next.0
  - @backstage/types@1.0.2-next.0
  - @backstage/backend-tasks@0.3.8-next.0
  - @backstage/catalog-model@1.1.4-next.0
  - @backstage/config@1.0.5-next.0
  - @backstage/errors@1.1.4-next.0
  - @backstage-community/plugin-tech-insights-common@0.2.9-next.0
  - @backstage-community/plugin-tech-insights-node@0.3.7-next.0

## 0.5.4

### Patch Changes

- f12e9e5b8c: Add Documentation on 404 Errors
- 06cf8f1cf2: Add a default delay to the fact retrievers to prevent cold-start errors
- 30e43717c7: Use `HumanDuration` from `@backstage/types`
- Updated dependencies
  - @backstage/backend-common@0.16.0
  - @backstage/backend-tasks@0.3.7
  - @backstage/catalog-model@1.1.3
  - @backstage/types@1.0.1
  - @backstage-community/plugin-tech-insights-node@0.3.6
  - @backstage/catalog-client@1.1.2
  - @backstage/config@1.0.4
  - @backstage/errors@1.1.3
  - @backstage-community/plugin-tech-insights-common@0.2.8

## 0.5.4-next.1

### Patch Changes

- f12e9e5b8c: Add Documentation on 404 Errors
- Updated dependencies
  - @backstage/backend-common@0.16.0-next.1
  - @backstage/backend-tasks@0.3.7-next.1
  - @backstage-community/plugin-tech-insights-node@0.3.6-next.1
  - @backstage/catalog-client@1.1.2-next.0
  - @backstage/catalog-model@1.1.3-next.0
  - @backstage/config@1.0.4-next.0
  - @backstage/errors@1.1.3-next.0
  - @backstage/types@1.0.1-next.0
  - @backstage-community/plugin-tech-insights-common@0.2.8-next.0

## 0.5.4-next.0

### Patch Changes

- 06cf8f1cf2: Add a default delay to the fact retrievers to prevent cold-start errors
- 30e43717c7: Use `HumanDuration` from `@backstage/types`
- Updated dependencies
  - @backstage/backend-common@0.16.0-next.0
  - @backstage/backend-tasks@0.3.7-next.0
  - @backstage/catalog-model@1.1.3-next.0
  - @backstage/types@1.0.1-next.0
  - @backstage-community/plugin-tech-insights-node@0.3.6-next.0
  - @backstage/catalog-client@1.1.2-next.0
  - @backstage/config@1.0.4-next.0
  - @backstage/errors@1.1.3-next.0
  - @backstage-community/plugin-tech-insights-common@0.2.8-next.0

## 0.5.3

### Patch Changes

- 296aea34da: The Tech Insights plugin supports running fact retrievers across multiple instances. Update the README to remove the stale instructions.
- 2d3a5f09ab: Use `response.json` rather than `response.send` where appropriate, as outlined in `SECURITY.md`
- f7cbfb97ed: Modify router endpoint to handle singular and collections of request parameters similarly.
- Updated dependencies
  - @backstage/catalog-model@1.1.2
  - @backstage/backend-common@0.15.2
  - @backstage/backend-tasks@0.3.6
  - @backstage/catalog-client@1.1.1
  - @backstage-community/plugin-tech-insights-node@0.3.5
  - @backstage/config@1.0.3
  - @backstage/errors@1.1.2
  - @backstage-community/plugin-tech-insights-common@0.2.7

## 0.5.3-next.2

### Patch Changes

- 2d3a5f09ab: Use `response.json` rather than `response.send` where appropriate, as outlined in `SECURITY.md`
- Updated dependencies
  - @backstage/backend-tasks@0.3.6-next.2
  - @backstage/backend-common@0.15.2-next.2
  - @backstage-community/plugin-tech-insights-node@0.3.5-next.2
  - @backstage/catalog-client@1.1.1-next.2
  - @backstage/catalog-model@1.1.2-next.2
  - @backstage/config@1.0.3-next.2
  - @backstage/errors@1.1.2-next.2
  - @backstage-community/plugin-tech-insights-common@0.2.7-next.2

## 0.5.3-next.1

### Patch Changes

- f7cbfb97ed: Modify router endpoint to handle singular and collections of request parameters similarly.
- Updated dependencies
  - @backstage/catalog-client@1.1.1-next.1
  - @backstage/backend-common@0.15.2-next.1
  - @backstage/backend-tasks@0.3.6-next.1
  - @backstage/catalog-model@1.1.2-next.1
  - @backstage/config@1.0.3-next.1
  - @backstage/errors@1.1.2-next.1
  - @backstage-community/plugin-tech-insights-common@0.2.7-next.1
  - @backstage-community/plugin-tech-insights-node@0.3.5-next.1

## 0.5.3-next.0

### Patch Changes

- Updated dependencies
  - @backstage/catalog-model@1.1.2-next.0
  - @backstage-community/plugin-tech-insights-node@0.3.5-next.0
  - @backstage/catalog-client@1.1.1-next.0
  - @backstage/backend-common@0.15.2-next.0
  - @backstage/backend-tasks@0.3.6-next.0
  - @backstage/config@1.0.3-next.0
  - @backstage/errors@1.1.2-next.0
  - @backstage-community/plugin-tech-insights-common@0.2.7-next.0

## 0.5.2

### Patch Changes

- 8872cc735d: Fixed a bug where the database option to skip migrations was ignored.
- 12c6a07c2a: Changed the description of the `techdocsAnnotationFactName` fact.
- 2e0689e536: Support for timeout in FactRetrieverRegistrationOptions
- 9e8e9f5243: Modify Tech insight initialization to expose FactRetrieverEngine. Enables users to trigger fact retrieval manually or reschedule retrievers on runtime.
- Updated dependencies
  - @backstage/backend-common@0.15.1
  - @backstage-community/plugin-tech-insights-node@0.3.4
  - @backstage/backend-tasks@0.3.5
  - @backstage/catalog-client@1.1.0
  - @backstage/catalog-model@1.1.1
  - @backstage/config@1.0.2
  - @backstage/errors@1.1.1

## 0.5.2-next.2

### Patch Changes

- Updated dependencies
  - @backstage/catalog-client@1.1.0-next.2
  - @backstage/catalog-model@1.1.1-next.0
  - @backstage/config@1.0.2-next.0
  - @backstage/errors@1.1.1-next.0
  - @backstage/backend-common@0.15.1-next.3
  - @backstage/backend-tasks@0.3.5-next.1
  - @backstage-community/plugin-tech-insights-node@0.3.4-next.1

## 0.5.2-next.1

### Patch Changes

- 12c6a07c2a: Changed the description of the `techdocsAnnotationFactName` fact.
- Updated dependencies
  - @backstage/backend-common@0.15.1-next.1

## 0.5.2-next.0

### Patch Changes

- 8872cc735d: Fixed a bug where the database option to skip migrations was ignored.
- 2e0689e536: Support for timeout in FactRetrieverRegistrationOptions
- 9e8e9f5243: Modify Tech insight initialization to expose FactRetrieverEngine. Enables users to trigger fact retrieval manually or reschedule retrievers on runtime.
- Updated dependencies
  - @backstage/backend-common@0.15.1-next.0
  - @backstage-community/plugin-tech-insights-node@0.3.4-next.0
  - @backstage/backend-tasks@0.3.5-next.0
  - @backstage/catalog-client@1.0.5-next.0

## 0.5.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.15.0
  - @backstage/backend-tasks@0.3.4
  - @backstage-community/plugin-tech-insights-common@0.2.6
  - @backstage-community/plugin-tech-insights-node@0.3.3

## 0.5.1-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.15.0-next.0
  - @backstage/backend-tasks@0.3.4-next.0
  - @backstage-community/plugin-tech-insights-common@0.2.6-next.0
  - @backstage-community/plugin-tech-insights-node@0.3.3-next.0

## 0.5.0

### Minor Changes

- 818fa28d71: Allow FactRetrieverRegistry to be injected into buildTechInsightsContext so that we can override default registry implementation.
- 46cfda58aa: **BREAKING**: Update FactRetrieverRegistry interface to be async so that db backed implementations can be passed through to the FactRetrieverEngine.

  If you have existing custom `FactRetrieverRegistry` implementations, you'll need to remove the `retrievers` member and make all the methods async.

### Patch Changes

- 2ef58ab539: TechInsightsBackend: Added missing 'scheduler' to code examples
- 4e9a90e307: Updated dependency `luxon` to `^3.0.0`.
- 679b32172e: Updated dependency `knex` to `^2.0.0`.
- bcc122c46d: The `FactRetriever` model has been extended by adding optional title and description fields, allowing you to display them in the UI.
- Updated dependencies
  - @backstage/backend-common@0.14.1
  - @backstage/catalog-model@1.1.0
  - @backstage/catalog-client@1.0.4
  - @backstage/backend-tasks@0.3.3
  - @backstage-community/plugin-tech-insights-common@0.2.5
  - @backstage-community/plugin-tech-insights-node@0.3.2
  - @backstage/errors@1.1.0

## 0.5.0-next.3

### Minor Changes

- 46cfda58aa: **BREAKING**: Update FactRetrieverRegistry interface to be async so that db backed implementations can be passed through to the FactRetrieverEngine.

  If you have existing custom `FactRetrieverRegistry` implementations, you'll need to remove the `retrievers` member and make all the methods async.

### Patch Changes

- 4e9a90e307: Updated dependency `luxon` to `^3.0.0`.
- bcc122c46d: The `FactRetriever` model has been extended by adding optional title and description fields, allowing you to display them in the UI.
- Updated dependencies
  - @backstage/backend-common@0.14.1-next.3
  - @backstage/catalog-client@1.0.4-next.2
  - @backstage/backend-tasks@0.3.3-next.3
  - @backstage-community/plugin-tech-insights-common@0.2.5-next.0
  - @backstage-community/plugin-tech-insights-node@0.3.2-next.1
  - @backstage/catalog-model@1.1.0-next.3

## 0.5.0-next.2

### Minor Changes

- 818fa28d71: Allow FactRetrieverRegistry to be injected into buildTechInsightsContext so that we can override default registry implementation.

### Patch Changes

- 679b32172e: Updated dependency `knex` to `^2.0.0`.
- Updated dependencies
  - @backstage/catalog-model@1.1.0-next.2
  - @backstage/backend-common@0.14.1-next.2
  - @backstage/backend-tasks@0.3.3-next.2

## 0.4.2-next.1

### Patch Changes

- Updated dependencies
  - @backstage/catalog-model@1.1.0-next.1
  - @backstage/backend-common@0.14.1-next.1
  - @backstage/errors@1.1.0-next.0
  - @backstage/backend-tasks@0.3.3-next.1
  - @backstage/catalog-client@1.0.4-next.1

## 0.4.2-next.0

### Patch Changes

- 2ef58ab539: TechInsightsBackend: Added missing 'scheduler' to code examples
- Updated dependencies
  - @backstage/backend-common@0.14.1-next.0
  - @backstage/catalog-model@1.1.0-next.0
  - @backstage/backend-tasks@0.3.3-next.0
  - @backstage-community/plugin-tech-insights-node@0.3.2-next.0
  - @backstage/catalog-client@1.0.4-next.0

## 0.4.1

### Patch Changes

- 4fee8f59e3: Updated tech-insights fetch/latest endpoint to return the actual latest row based on the timestamp
- aa15229ec3: Introduce additional JsonValue types to be storable as facts. This enables the possibility to store more complex objects for fact checking purposes. The rules engine supports walking keyed object values directly to create rules and checks

  Modify facts database table to have a more restricted timestamp precision for cases where the postgres server isn't configured to contain such value. This fixes the issue where in some cases `maxItems` lifecycle condition didn't work as expected.

- Updated dependencies
  - @backstage/backend-tasks@0.3.2
  - @backstage/backend-common@0.14.0
  - @backstage/catalog-client@1.0.3
  - @backstage/catalog-model@1.0.3
  - @backstage-community/plugin-tech-insights-node@0.3.1

## 0.4.1-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.14.0-next.2
  - @backstage/backend-tasks@0.3.2-next.2
  - @backstage-community/plugin-tech-insights-node@0.3.1-next.1

## 0.4.1-next.1

### Patch Changes

- 4fee8f59e3: Updated tech-insights fetch/latest endpoint to return the actual latest row based on the timestamp
- Updated dependencies
  - @backstage/backend-tasks@0.3.2-next.1
  - @backstage/backend-common@0.13.6-next.1
  - @backstage/catalog-client@1.0.3-next.0
  - @backstage/catalog-model@1.0.3-next.0

## 0.4.1-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-tasks@0.3.2-next.0
  - @backstage/backend-common@0.13.6-next.0
  - @backstage-community/plugin-tech-insights-node@0.3.1-next.0

## 0.4.0

### Minor Changes

- 3333e20b27: **BREAKING**: The `buildTechInsightsContext` function now takes an additional
  field in its options argument: `tokenManager`. This is an instance of
  `TokenManager`, which can be found in your backend initialization code's
  `env`.

  ```diff
   const builder = buildTechInsightsContext({
     logger: env.logger,
     config: env.config,
     database: env.database,
     discovery: env.discovery,
     scheduler: env.scheduler,
  +  tokenManager: env.tokenManager,
     factRetrievers: [ /* ... */ ],
   });
  ```

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.13.3
  - @backstage/backend-tasks@0.3.1
  - @backstage-community/plugin-tech-insights-node@0.3.0
  - @backstage/config@1.0.1
  - @backstage/catalog-client@1.0.2
  - @backstage/catalog-model@1.0.2

## 0.4.0-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.13.3-next.2
  - @backstage/backend-tasks@0.3.1-next.1
  - @backstage/config@1.0.1-next.0
  - @backstage/catalog-model@1.0.2-next.0
  - @backstage-community/plugin-tech-insights-node@0.3.0-next.2
  - @backstage/catalog-client@1.0.2-next.0

## 0.4.0-next.1

### Minor Changes

- 3333e20b27: **BREAKING**: The `buildTechInsightsContext` function now takes an additional
  field in its options argument: `tokenManager`. This is an instance of
  `TokenManager`, which can be found in your backend initialization code's
  `env`.

  ```diff
   const builder = buildTechInsightsContext({
     logger: env.logger,
     config: env.config,
     database: env.database,
     discovery: env.discovery,
     scheduler: env.scheduler,
  +  tokenManager: env.tokenManager,
     factRetrievers: [ /* ... */ ],
   });
  ```

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.13.3-next.1
  - @backstage-community/plugin-tech-insights-node@0.3.0-next.1

## 0.3.1-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.13.3-next.0
  - @backstage/backend-tasks@0.3.1-next.0
  - @backstage-community/plugin-tech-insights-node@0.2.10-next.0

## 0.3.0

### Minor Changes

- 231fee736b: This backend now uses the `@backstage/backend-tasks` package facilities for scheduling fact retrievers.

  **BREAKING**: The `buildTechInsightsContext` function now takes an additional field in its options argument: `scheduler`. This is an instance of `PluginTaskScheduler`, which can be found in your backend initialization code's `env`.

  ```diff
   const builder = buildTechInsightsContext({
     logger: env.logger,
     config: env.config,
     database: env.database,
     discovery: env.discovery,
  +  scheduler: env.scheduler,
     factRetrievers: [ /* ... */ ],
   });
  ```

### Patch Changes

- 21de525ce9: Updated README.md with better install instructions
- c47509e1a0: Implemented changes suggested by Deepsource.io including multiple double non-null assertion operators and unexpected awaits for non-promise values.
- 2fe58c7285: Improved the Tech-Insights documentation:

  - `lifecycle` examples used `ttl` when it should be `timeToLive`
  - Added list of included FactRetrievers
  - Added full backend example using all included FactRetrievers
  - Added boolean scorecard example image showing results of backend example

- Updated dependencies
  - @backstage/backend-tasks@0.3.0
  - @backstage/catalog-model@1.0.1
  - @backstage-community/plugin-tech-insights-node@0.2.9
  - @backstage/backend-common@0.13.2
  - @backstage/catalog-client@1.0.1

## 0.3.0-next.2

### Patch Changes

- 21de525ce9: Updated README.md with better install instructions
- Updated dependencies
  - @backstage/backend-tasks@0.3.0-next.2
  - @backstage/catalog-model@1.0.1-next.1

## 0.3.0-next.1

### Minor Changes

- 231fee736b: This backend now uses the `@backstage/backend-tasks` package facilities for scheduling fact retrievers.

  **BREAKING**: The `buildTechInsightsContext` function now takes an additional field in its options argument: `scheduler`. This is an instance of `PluginTaskScheduler`, which can be found in your backend initialization code's `env`.

  ```diff
   const builder = buildTechInsightsContext({
     logger: env.logger,
     config: env.config,
     database: env.database,
     discovery: env.discovery,
  +  scheduler: env.scheduler,
     factRetrievers: [ /* ... */ ],
   });
  ```

### Patch Changes

- Updated dependencies
  - @backstage/backend-tasks@0.3.0-next.1
  - @backstage-community/plugin-tech-insights-node@0.2.9-next.1
  - @backstage/backend-common@0.13.2-next.1

## 0.2.11-next.0

### Patch Changes

- c47509e1a0: Implemented changes suggested by Deepsource.io including multiple double non-null assertion operators and unexpected awaits for non-promise values.
- 2fe58c7285: Improved the Tech-Insights documentation:

  - `lifecycle` examples used `ttl` when it should be `timeToLive`
  - Added list of included FactRetrievers
  - Added full backend example using all included FactRetrievers
  - Added boolean scorecard example image showing results of backend example

- Updated dependencies
  - @backstage/catalog-model@1.0.1-next.0
  - @backstage/backend-common@0.13.2-next.0
  - @backstage/catalog-client@1.0.1-next.0
  - @backstage-community/plugin-tech-insights-node@0.2.9-next.0

## 0.2.10

### Patch Changes

- 89c7e47967: Minor README update
- Updated dependencies
  - @backstage/backend-common@0.13.1
  - @backstage/catalog-model@1.0.0
  - @backstage/catalog-client@1.0.0
  - @backstage/config@1.0.0
  - @backstage/errors@1.0.0
  - @backstage-community/plugin-tech-insights-common@0.2.4
  - @backstage-community/plugin-tech-insights-node@0.2.8

## 0.2.9

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.13.0
  - @backstage/catalog-model@0.13.0
  - @backstage/catalog-client@0.9.0
  - @backstage-community/plugin-tech-insights-node@0.2.7

## 0.2.9-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.13.0-next.0
  - @backstage/catalog-model@0.13.0-next.0
  - @backstage/catalog-client@0.9.0-next.0
  - @backstage-community/plugin-tech-insights-node@0.2.7-next.0

## 0.2.8

### Patch Changes

- 36aa63022b: Use `CompoundEntityRef` instead of `EntityName`, and `getCompoundEntityRef` instead of `getEntityName`, from `@backstage/catalog-model`.
- Updated dependencies
  - @backstage/catalog-model@0.12.0
  - @backstage/catalog-client@0.8.0
  - @backstage/backend-common@0.12.0
  - @backstage-community/plugin-tech-insights-node@0.2.6

## 0.2.7

### Patch Changes

- 67a7c02d26: Remove usages of `EntityRef` and `parseEntityName` from `@backstage/catalog-model`
- 919cf2f836: Minor updates to match the new `targetRef` field of relations, and to stop consuming the `target` field
- Updated dependencies
  - @backstage/backend-common@0.11.0
  - @backstage/catalog-model@0.11.0
  - @backstage/catalog-client@0.7.2
  - @backstage-community/plugin-tech-insights-node@0.2.5

## 0.2.6

### Patch Changes

- Fix for the previous release with missing type declarations.
- Updated dependencies
  - @backstage/backend-common@0.10.9
  - @backstage/catalog-client@0.7.1
  - @backstage/catalog-model@0.10.1
  - @backstage/config@0.1.15
  - @backstage/errors@0.2.2
  - @backstage-community/plugin-tech-insights-common@0.2.3
  - @backstage-community/plugin-tech-insights-node@0.2.4

## 0.2.5

### Patch Changes

- c77c5c7eb6: Added `backstage.role` to `package.json`
- 538ca90790: Use updated type names from `@backstage/catalog-client`
- Updated dependencies
  - @backstage/backend-common@0.10.8
  - @backstage/catalog-client@0.7.0
  - @backstage/errors@0.2.1
  - @backstage/catalog-model@0.10.0
  - @backstage/config@0.1.14
  - @backstage-community/plugin-tech-insights-common@0.2.2
  - @backstage-community/plugin-tech-insights-node@0.2.3

## 0.2.4

### Patch Changes

- 2441d1cf59: chore(deps): bump `knex` from 0.95.6 to 1.0.2

  This also replaces `sqlite3` with `@vscode/sqlite3` 5.0.7

- Updated dependencies
  - @backstage/catalog-client@0.6.0
  - @backstage/backend-common@0.10.7
  - @backstage-community/plugin-tech-insights-node@0.2.2

## 0.2.4-next.0

### Patch Changes

- 2441d1cf59: chore(deps): bump `knex` from 0.95.6 to 1.0.2

  This also replaces `sqlite3` with `@vscode/sqlite3` 5.0.7

- Updated dependencies
  - @backstage/backend-common@0.10.7-next.0
  - @backstage-community/plugin-tech-insights-node@0.2.2-next.0

## 0.2.3

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.10.6
  - @backstage-community/plugin-tech-insights-node@0.2.1

## 0.2.3-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.10.6-next.0
  - @backstage-community/plugin-tech-insights-node@0.2.1-next.0

## 0.2.2

### Patch Changes

- bbb6622752: Update README to match config options.
- Updated dependencies
  - @backstage/backend-common@0.10.5

## 0.2.1

### Patch Changes

- ad0a7eb088: Fixed invalid access that caused an immediate crash with a `TypeError` when loading the package.

## 0.2.0

### Minor Changes

- dfd5e81721: BREAKING CHANGES:

  - The helper function to create a fact retriever registration is now expecting an object of configuration items instead of individual arguments.
    Modify your `techInsights.ts` plugin configuration in `packages/backend/src/plugins/techInsights.ts` (or equivalent) the following way:

  ```diff
  -createFactRetrieverRegistration(
  -  '1 1 1 * *', // Example cron, At 01:01 on day-of-month 1.
  -  entityOwnershipFactRetriever,
  -),
  +createFactRetrieverRegistration({
  +  cadence: '1 1 1 * *', // Example cron, At 01:01 on day-of-month 1.
  +  factRetriever: entityOwnershipFactRetriever,
  +}),

  ```

  - `TechInsightsStore` interface has changed its signature of `insertFacts` method. If you have created your own implementation of either `TechInsightsDatabase` or `FactRetrieverEngine` you need to modify the implementation/call to this method to accept/pass-in an object instead if individual arguments. The interface now accepts an additional `lifecycle` argument which is optional (defined below). An example modification to fact retriever engine:

  ```diff
  -await this.repository.insertFacts(factRetriever.id, facts);
  +await this.repository.insertFacts({
  + id: factRetriever.id,
  + facts,
  + lifecycle,
  +});
  ```

  Adds a configuration option to fact retrievers to define lifecycle for facts the retriever persists. Possible values are either 'max items' or 'time-to-live'. The former will keep only n number of items in the database for each fact per entity. The latter will remove all facts that are older than the TTL value.

  Possible values:

  - `{ maxItems: 5 }` // Deletes all facts for the retriever/entity pair, apart from the last five
  - `{ ttl: 1209600000 }` // (2 weeks) Deletes all facts older than 2 weeks for the retriever/entity pair
  - `{ ttl: { weeks: 2 } }` // Deletes all facts older than 2 weeks for the retriever/entity pair

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.10.4
  - @backstage/config@0.1.13
  - @backstage-community/plugin-tech-insights-node@0.2.0
  - @backstage/catalog-model@0.9.10
  - @backstage/catalog-client@0.5.5

## 0.2.0-next.0

### Minor Changes

- dfd5e81721: BREAKING CHANGES:

  - The helper function to create a fact retriever registration is now expecting an object of configuration items instead of individual arguments.
    Modify your `techInsights.ts` plugin configuration in `packages/backend/src/plugins/techInsights.ts` (or equivalent) the following way:

  ```diff
  -createFactRetrieverRegistration(
  -  '1 1 1 * *', // Example cron, At 01:01 on day-of-month 1.
  -  entityOwnershipFactRetriever,
  -),
  +createFactRetrieverRegistration({
  +  cadence: '1 1 1 * *', // Example cron, At 01:01 on day-of-month 1.
  +  factRetriever: entityOwnershipFactRetriever,
  +}),

  ```

  - `TechInsightsStore` interface has changed its signature of `insertFacts` method. If you have created your own implementation of either `TechInsightsDatabase` or `FactRetrieverEngine` you need to modify the implementation/call to this method to accept/pass-in an object instead if individual arguments. The interface now accepts an additional `lifecycle` argument which is optional (defined below). An example modification to fact retriever engine:

  ```diff
  -await this.repository.insertFacts(factRetriever.id, facts);
  +await this.repository.insertFacts({
  + id: factRetriever.id,
  + facts,
  + lifecycle,
  +});
  ```

  Adds a configuration option to fact retrievers to define lifecycle for facts the retriever persists. Possible values are either 'max items' or 'time-to-live'. The former will keep only n number of items in the database for each fact per entity. The latter will remove all facts that are older than the TTL value.

  Possible values:

  - `{ maxItems: 5 }` // Deletes all facts for the retriever/entity pair, apart from the last five
  - `{ ttl: 1209600000 }` // (2 weeks) Deletes all facts older than 2 weeks for the retriever/entity pair
  - `{ ttl: { weeks: 2 } }` // Deletes all facts older than 2 weeks for the retriever/entity pair

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.10.4-next.0
  - @backstage/config@0.1.13-next.0
  - @backstage-community/plugin-tech-insights-node@0.2.0-next.0
  - @backstage/catalog-model@0.9.10-next.0
  - @backstage/catalog-client@0.5.5-next.0

## 0.1.5

### Patch Changes

- 19f0f93504: Catch errors from a fact retriever and log them.
- 10f26e8883: Modify queries to perform better by filtering on sub-queries as well
- a60eb0f0dd: adding new operation to run checks for multiple entities in one request
- Updated dependencies
  - @backstage/config@0.1.12
  - @backstage/backend-common@0.10.3
  - @backstage-community/plugin-tech-insights-common@0.2.1
  - @backstage/errors@0.2.0
  - @backstage/catalog-client@0.5.4
  - @backstage/catalog-model@0.9.9

## 0.1.4

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.10.0
  - @backstage/catalog-client@0.5.3
  - @backstage-community/plugin-tech-insights-node@0.1.2

## 0.1.3

### Patch Changes

- b055a6addc: Align on usage of `cross-fetch` vs `node-fetch` in frontend vs backend packages, and remove some unnecessary imports of either one of them
- b5bd60fddc: Removed unnecessary check for specific server error in `@backstage plugin-tech-insights-backend`.
- c6c8b8e53e: Minor fixes in Readme to make the examples more directly usable.
- Updated dependencies
  - @backstage-community/plugin-tech-insights-common@0.2.0
  - @backstage/backend-common@0.9.12
  - @backstage-community/plugin-tech-insights-node@0.1.1

## 0.1.2

### Patch Changes

- 2017de90da: Update README docs to use correct function/parameter names
- Updated dependencies
  - @backstage/errors@0.1.5
  - @backstage/backend-common@0.9.11

## 0.1.1

### Patch Changes

- 5c00e45045: Add catalog fact retrievers

  Add fact retrievers which generate facts related to the completeness
  of entity data in the catalog.

- Updated dependencies
  - @backstage/catalog-client@0.5.2
  - @backstage/catalog-model@0.9.7
  - @backstage/backend-common@0.9.10
