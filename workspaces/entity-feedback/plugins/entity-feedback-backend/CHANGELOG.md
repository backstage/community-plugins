# @backstage-community/plugin-entity-feedback-backend

## 0.4.0

### Minor Changes

- fcf6f84: **BREAKING** `auth`, `config`, and `httpAuth` are now required, please migrate to the new backend system as the best path forward for this change.

  Also, removed usages and references of `@backstage/backend-common`

## 0.3.2

### Patch Changes

- 8cc3f65: Backstage version bump to v1.32.2
- Updated dependencies [8cc3f65]
  - @backstage-community/plugin-entity-feedback-common@0.1.11

## 0.3.1

### Patch Changes

- 2143b60: Backstage version bump to v1.31.1
- Updated dependencies [2143b60]
  - @backstage-community/plugin-entity-feedback-common@0.1.10

## 0.3.0

### Minor Changes

- 6ab3e6d: The `identity` service is now optional. It has been removed as a plugin dependency for
  the new backend system.

## 0.2.21

### Patch Changes

- 3aa6178: Backstage version bump to v1.30.2
- Updated dependencies [3aa6178]
  - @backstage-community/plugin-entity-feedback-common@0.1.9

## 0.2.20

### Patch Changes

- ae2ee8a: Updated dependency `@types/supertest` to `^6.0.0`.
  Updated dependency `supertest` to `^7.0.0`.

## 0.2.19

### Patch Changes

- a9b673e: version:bump to v1.29.1
- Updated dependencies [a9b673e]
  - @backstage-community/plugin-entity-feedback-common@0.1.8

## 0.2.18

### Patch Changes

- 804a245: Fix package metadata
- Updated dependencies [804a245]
  - @backstage-community/plugin-entity-feedback-common@0.1.7

## 0.2.17

### Patch Changes

- c2cc0b9: Update dependencies to Backstage v1.28.3
- Updated dependencies [c2cc0b9]
  - @backstage-community/plugin-entity-feedback-common@0.1.6

## 0.2.16

### Patch Changes

- 063687c: Update dependencies to Backstage version 1.27
- Updated dependencies [063687c]
  - @backstage-community/plugin-entity-feedback-common@0.1.5

## 0.2.15

### Patch Changes

- 193a2a3: Migrated from the [backstage/backstage](https://github.com/backstage/backstage) monorepo.
- Updated dependencies [193a2a3]
  - @backstage-community/plugin-entity-feedback-common@0.1.4

## 0.2.14

### Patch Changes

- d5a1fe1: Replaced winston logger with `LoggerService`
- Updated dependencies
  - @backstage/backend-common@0.21.7
  - @backstage/backend-plugin-api@0.6.17
  - @backstage/plugin-auth-node@0.4.12
  - @backstage/catalog-client@1.6.4
  - @backstage/catalog-model@1.4.5
  - @backstage/config@1.2.0
  - @backstage/errors@1.2.4
  - @backstage-community/plugin-entity-feedback-common@0.1.3

## 0.2.14-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.21.7-next.1
  - @backstage/backend-plugin-api@0.6.17-next.1
  - @backstage/plugin-auth-node@0.4.12-next.1
  - @backstage/catalog-client@1.6.4-next.0
  - @backstage/catalog-model@1.4.5
  - @backstage/config@1.2.0
  - @backstage/errors@1.2.4
  - @backstage-community/plugin-entity-feedback-common@0.1.3

## 0.2.14-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.21.7-next.0
  - @backstage/backend-plugin-api@0.6.17-next.0
  - @backstage/catalog-client@1.6.3
  - @backstage/catalog-model@1.4.5
  - @backstage/config@1.2.0
  - @backstage/errors@1.2.4
  - @backstage/plugin-auth-node@0.4.12-next.0
  - @backstage-community/plugin-entity-feedback-common@0.1.3

## 0.2.13

### Patch Changes

- Updated dependencies
  - @backstage/catalog-client@1.6.3
  - @backstage/plugin-auth-node@0.4.11
  - @backstage/backend-common@0.21.6
  - @backstage/backend-plugin-api@0.6.16
  - @backstage/catalog-model@1.4.5
  - @backstage/config@1.2.0
  - @backstage/errors@1.2.4
  - @backstage-community/plugin-entity-feedback-common@0.1.3

## 0.2.12

### Patch Changes

- Updated dependencies
  - @backstage/catalog-client@1.6.2
  - @backstage/backend-common@0.21.5
  - @backstage/plugin-auth-node@0.4.10
  - @backstage/backend-plugin-api@0.6.15
  - @backstage/catalog-model@1.4.5
  - @backstage/config@1.2.0
  - @backstage/errors@1.2.4
  - @backstage-community/plugin-entity-feedback-common@0.1.3

## 0.2.11

### Patch Changes

- 45115fd: Add in description for 400 response when encountering an invalid rating request
- 4f8ecd6: Migrated to support new auth services.
- Updated dependencies
  - @backstage/backend-common@0.21.4
  - @backstage/plugin-auth-node@0.4.9
  - @backstage/config@1.2.0
  - @backstage/errors@1.2.4
  - @backstage/backend-plugin-api@0.6.14
  - @backstage/catalog-client@1.6.1
  - @backstage/catalog-model@1.4.5
  - @backstage-community/plugin-entity-feedback-common@0.1.3

## 0.2.11-next.2

### Patch Changes

- Updated dependencies
  - @backstage/catalog-client@1.6.1-next.1
  - @backstage/backend-common@0.21.4-next.2
  - @backstage/plugin-auth-node@0.4.9-next.2
  - @backstage/backend-plugin-api@0.6.14-next.2
  - @backstage/catalog-model@1.4.5-next.0
  - @backstage/config@1.2.0-next.1
  - @backstage/errors@1.2.4-next.0
  - @backstage-community/plugin-entity-feedback-common@0.1.3

## 0.2.11-next.1

### Patch Changes

- 45115fd: Add in description for 400 response when encountering an invalid rating request
- Updated dependencies
  - @backstage/config@1.2.0-next.1
  - @backstage/backend-common@0.21.4-next.1
  - @backstage/backend-plugin-api@0.6.14-next.1
  - @backstage/plugin-auth-node@0.4.9-next.1
  - @backstage/catalog-client@1.6.1-next.0
  - @backstage/catalog-model@1.4.5-next.0
  - @backstage/errors@1.2.4-next.0
  - @backstage-community/plugin-entity-feedback-common@0.1.3

## 0.2.10-next.0

### Patch Changes

- 4f8ecd6: Migrated to support new auth services.
- Updated dependencies
  - @backstage/backend-common@0.21.3-next.0
  - @backstage/plugin-auth-node@0.4.8-next.0
  - @backstage/backend-plugin-api@0.6.13-next.0
  - @backstage/catalog-client@1.6.1-next.0
  - @backstage/catalog-model@1.4.5-next.0
  - @backstage/config@1.1.2-next.0
  - @backstage-community/plugin-entity-feedback-common@0.1.3

## 0.2.7

### Patch Changes

- b64ce5a: Updated New Backend System instructions to use default import
- 9aac2b0: Use `--cwd` as the first `yarn` argument
- Updated dependencies
  - @backstage/backend-common@0.21.0
  - @backstage/plugin-auth-node@0.4.4
  - @backstage/backend-plugin-api@0.6.10
  - @backstage/catalog-model@1.4.4
  - @backstage/catalog-client@1.6.0
  - @backstage/config@1.1.1
  - @backstage-community/plugin-entity-feedback-common@0.1.3

## 0.2.7-next.3

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.21.0-next.3
  - @backstage/plugin-auth-node@0.4.4-next.3
  - @backstage/backend-plugin-api@0.6.10-next.3
  - @backstage/catalog-client@1.6.0-next.1
  - @backstage/catalog-model@1.4.4-next.0
  - @backstage/config@1.1.1
  - @backstage-community/plugin-entity-feedback-common@0.1.3

## 0.2.7-next.2

### Patch Changes

- 9aac2b0: Use `--cwd` as the first `yarn` argument
- Updated dependencies
  - @backstage/backend-common@0.21.0-next.2
  - @backstage/backend-plugin-api@0.6.10-next.2
  - @backstage/plugin-auth-node@0.4.4-next.2
  - @backstage/config@1.1.1
  - @backstage/catalog-client@1.6.0-next.1
  - @backstage/catalog-model@1.4.4-next.0
  - @backstage-community/plugin-entity-feedback-common@0.1.3

## 0.2.7-next.1

### Patch Changes

- Updated dependencies
  - @backstage/catalog-model@1.4.4-next.0
  - @backstage/catalog-client@1.6.0-next.1
  - @backstage/backend-plugin-api@0.6.10-next.1
  - @backstage/backend-common@0.21.0-next.1
  - @backstage/config@1.1.1
  - @backstage/plugin-auth-node@0.4.4-next.1
  - @backstage-community/plugin-entity-feedback-common@0.1.3

## 0.2.7-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.21.0-next.0
  - @backstage/catalog-client@1.6.0-next.0
  - @backstage/plugin-auth-node@0.4.4-next.0
  - @backstage/backend-plugin-api@0.6.10-next.0
  - @backstage/catalog-model@1.4.3
  - @backstage/config@1.1.1
  - @backstage-community/plugin-entity-feedback-common@0.1.3

## 0.2.6

### Patch Changes

- 4016f21: Remove some unused dependencies
- Updated dependencies
  - @backstage/backend-common@0.20.1
  - @backstage/catalog-client@1.5.2
  - @backstage/backend-plugin-api@0.6.9
  - @backstage/plugin-auth-node@0.4.3
  - @backstage/catalog-model@1.4.3
  - @backstage/config@1.1.1
  - @backstage-community/plugin-entity-feedback-common@0.1.3

## 0.2.6-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-plugin-api@0.6.9-next.2
  - @backstage/backend-common@0.20.1-next.2
  - @backstage/plugin-auth-node@0.4.3-next.2

## 0.2.6-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.20.1-next.1
  - @backstage/config@1.1.1
  - @backstage/plugin-auth-node@0.4.3-next.1
  - @backstage/backend-plugin-api@0.6.9-next.1
  - @backstage/catalog-client@1.5.2-next.0
  - @backstage/catalog-model@1.4.3
  - @backstage-community/plugin-entity-feedback-common@0.1.3

## 0.2.6-next.0

### Patch Changes

- 4016f21: Remove some unused dependencies
- Updated dependencies
  - @backstage/backend-common@0.20.1-next.0
  - @backstage/catalog-client@1.5.2-next.0
  - @backstage/backend-plugin-api@0.6.9-next.0
  - @backstage/catalog-model@1.4.3
  - @backstage/config@1.1.1
  - @backstage/plugin-auth-node@0.4.3-next.0
  - @backstage-community/plugin-entity-feedback-common@0.1.3

## 0.2.5

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.20.0
  - @backstage/catalog-client@1.5.0
  - @backstage/plugin-auth-node@0.4.2
  - @backstage/backend-plugin-api@0.6.8
  - @backstage/catalog-model@1.4.3
  - @backstage/config@1.1.1
  - @backstage-community/plugin-entity-feedback-common@0.1.3

## 0.2.5-next.3

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.20.0-next.3
  - @backstage/backend-plugin-api@0.6.8-next.3
  - @backstage/catalog-client@1.5.0-next.1
  - @backstage/catalog-model@1.4.3
  - @backstage/config@1.1.1
  - @backstage/plugin-auth-node@0.4.2-next.3
  - @backstage-community/plugin-entity-feedback-common@0.1.3

## 0.2.5-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.20.0-next.2
  - @backstage/plugin-auth-node@0.4.2-next.2
  - @backstage/catalog-client@1.5.0-next.1
  - @backstage/backend-plugin-api@0.6.8-next.2
  - @backstage/catalog-model@1.4.3
  - @backstage/config@1.1.1
  - @backstage-community/plugin-entity-feedback-common@0.1.3

## 0.2.5-next.1

### Patch Changes

- Updated dependencies
  - @backstage/catalog-client@1.5.0-next.0
  - @backstage/backend-common@0.20.0-next.1
  - @backstage/backend-plugin-api@0.6.8-next.1
  - @backstage/catalog-model@1.4.3
  - @backstage/config@1.1.1
  - @backstage/plugin-auth-node@0.4.2-next.1
  - @backstage-community/plugin-entity-feedback-common@0.1.3

## 0.2.5-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.20.0-next.0
  - @backstage/plugin-auth-node@0.4.2-next.0
  - @backstage/backend-plugin-api@0.6.8-next.0
  - @backstage/catalog-client@1.4.6
  - @backstage/catalog-model@1.4.3
  - @backstage/config@1.1.1
  - @backstage-community/plugin-entity-feedback-common@0.1.3

## 0.2.4

### Patch Changes

- 013611b42e: `knex` has been bumped to major version 3 and `better-sqlite3` to major version 9, which deprecate node 16 support.
- Updated dependencies
  - @backstage/backend-common@0.19.9
  - @backstage/backend-plugin-api@0.6.7
  - @backstage/catalog-client@1.4.6
  - @backstage/catalog-model@1.4.3
  - @backstage/config@1.1.1
  - @backstage/plugin-auth-node@0.4.1
  - @backstage-community/plugin-entity-feedback-common@0.1.3

## 0.2.4-next.2

### Patch Changes

- [#20570](https://github.com/backstage/backstage/pull/20570) [`013611b42e`](https://github.com/backstage/backstage/commit/013611b42ed457fefa9bb85fddf416cf5e0c1f76) Thanks [@freben](https://github.com/freben)! - `knex` has been bumped to major version 3 and `better-sqlite3` to major version 9, which deprecate node 16 support.

- Updated dependencies
  - @backstage/backend-plugin-api@0.6.7-next.2
  - @backstage/backend-common@0.19.9-next.2
  - @backstage/plugin-auth-node@0.4.1-next.2

## 0.2.4-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.9-next.1
  - @backstage/plugin-auth-node@0.4.1-next.1
  - @backstage/backend-plugin-api@0.6.7-next.1
  - @backstage/catalog-client@1.4.5
  - @backstage/catalog-model@1.4.3
  - @backstage/config@1.1.1
  - @backstage-community/plugin-entity-feedback-common@0.1.3

## 0.2.4-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.9-next.0
  - @backstage/backend-plugin-api@0.6.7-next.0
  - @backstage/catalog-client@1.4.5
  - @backstage/catalog-model@1.4.3
  - @backstage/config@1.1.1
  - @backstage/plugin-auth-node@0.4.1-next.0
  - @backstage-community/plugin-entity-feedback-common@0.1.3

## 0.2.3

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.8
  - @backstage/plugin-auth-node@0.4.0
  - @backstage/catalog-model@1.4.3
  - @backstage/backend-plugin-api@0.6.6
  - @backstage/catalog-client@1.4.5
  - @backstage/config@1.1.1
  - @backstage-community/plugin-entity-feedback-common@0.1.3

## 0.2.3-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.8-next.2
  - @backstage/plugin-auth-node@0.4.0-next.2
  - @backstage/catalog-model@1.4.3-next.0
  - @backstage/backend-plugin-api@0.6.6-next.2
  - @backstage/catalog-client@1.4.5-next.0
  - @backstage/config@1.1.1-next.0
  - @backstage-community/plugin-entity-feedback-common@0.1.3

## 0.2.2-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.7-next.1
  - @backstage/backend-plugin-api@0.6.5-next.1
  - @backstage/plugin-auth-node@0.3.2-next.1
  - @backstage/config@1.1.0
  - @backstage/catalog-client@1.4.4
  - @backstage/catalog-model@1.4.2
  - @backstage-community/plugin-entity-feedback-common@0.1.3

## 0.2.2-next.0

### Patch Changes

- Updated dependencies
  - @backstage/plugin-auth-node@0.3.2-next.0
  - @backstage/backend-common@0.19.7-next.0
  - @backstage/config@1.1.0
  - @backstage/backend-plugin-api@0.6.5-next.0
  - @backstage/catalog-client@1.4.4
  - @backstage/catalog-model@1.4.2
  - @backstage-community/plugin-entity-feedback-common@0.1.3

## 0.2.0

### Minor Changes

- 71114ac50e02: **BREAKING**: The export for the new backend system has been moved to be the `default` export.

  For example, if you are currently importing the plugin using the following pattern:

  ```ts
  import { examplePlugin } from '@backstage/plugin-example-backend';

  backend.add(examplePlugin);
  ```

  It should be migrated to this:

  ```ts
  backend.add(import('@backstage/plugin-example-backend'));
  ```

### Patch Changes

- 740155e8e976: Improve backend logging if method calls fail
- Updated dependencies
  - @backstage/backend-common@0.19.5
  - @backstage/plugin-auth-node@0.3.0
  - @backstage/config@1.1.0
  - @backstage/catalog-client@1.4.4
  - @backstage/catalog-model@1.4.2
  - @backstage-community/plugin-entity-feedback-common@0.1.3
  - @backstage/backend-plugin-api@0.6.3

## 0.2.0-next.3

### Minor Changes

- 71114ac50e02: **BREAKING**: The export for the new backend system has been moved to be the `default` export.

  For example, if you are currently importing the plugin using the following pattern:

  ```ts
  import { examplePlugin } from '@backstage/plugin-example-backend';

  backend.add(examplePlugin);
  ```

  It should be migrated to this:

  ```ts
  backend.add(import('@backstage/plugin-example-backend'));
  ```

### Patch Changes

- Updated dependencies
  - @backstage/catalog-client@1.4.4-next.2
  - @backstage/catalog-model@1.4.2-next.2
  - @backstage/config@1.1.0-next.2
  - @backstage-community/plugin-entity-feedback-common@0.1.3-next.0
  - @backstage/backend-plugin-api@0.6.3-next.3
  - @backstage/backend-common@0.19.5-next.3
  - @backstage/plugin-auth-node@0.3.0-next.3

## 0.1.9-next.2

### Patch Changes

- Updated dependencies
  - @backstage/config@1.1.0-next.1
  - @backstage/backend-common@0.19.5-next.2
  - @backstage/plugin-auth-node@0.3.0-next.2
  - @backstage/backend-plugin-api@0.6.3-next.2
  - @backstage/catalog-model@1.4.2-next.1
  - @backstage/catalog-client@1.4.4-next.1
  - @backstage-community/plugin-entity-feedback-common@0.1.2

## 0.1.9-next.1

### Patch Changes

- Updated dependencies
  - @backstage/config@1.1.0-next.0
  - @backstage/backend-common@0.19.5-next.1
  - @backstage/backend-plugin-api@0.6.3-next.1
  - @backstage/catalog-model@1.4.2-next.0
  - @backstage/plugin-auth-node@0.3.0-next.1
  - @backstage/catalog-client@1.4.4-next.0
  - @backstage-community/plugin-entity-feedback-common@0.1.2

## 0.1.8-next.0

### Patch Changes

- 740155e8e976: Improve backend logging if method calls fail
- Updated dependencies
  - @backstage/plugin-auth-node@0.3.0-next.0
  - @backstage/backend-common@0.19.4-next.0
  - @backstage/backend-plugin-api@0.6.2-next.0
  - @backstage/catalog-client@1.4.3
  - @backstage/catalog-model@1.4.1
  - @backstage/config@1.0.8
  - @backstage-community/plugin-entity-feedback-common@0.1.2

## 0.1.6

### Patch Changes

- 12a8c94eda8d: Add package repository and homepage metadata
- Updated dependencies
  - @backstage/backend-common@0.19.2
  - @backstage/backend-plugin-api@0.6.0
  - @backstage-community/plugin-entity-feedback-common@0.1.2
  - @backstage/plugin-auth-node@0.2.17
  - @backstage/catalog-client@1.4.3
  - @backstage/catalog-model@1.4.1
  - @backstage/config@1.0.8

## 0.1.6-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-plugin-api@0.6.0-next.2
  - @backstage/backend-common@0.19.2-next.2
  - @backstage/plugin-auth-node@0.2.17-next.2

## 0.1.6-next.1

### Patch Changes

- 12a8c94eda8d: Add package repository and homepage metadata
- Updated dependencies
  - @backstage/backend-common@0.19.2-next.1
  - @backstage-community/plugin-entity-feedback-common@0.1.2-next.0
  - @backstage/plugin-auth-node@0.2.17-next.1
  - @backstage/backend-plugin-api@0.6.0-next.1
  - @backstage/catalog-client@1.4.3
  - @backstage/catalog-model@1.4.1
  - @backstage/config@1.0.8

## 0.1.6-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.2-next.0
  - @backstage/backend-plugin-api@0.5.5-next.0
  - @backstage/catalog-client@1.4.3
  - @backstage/catalog-model@1.4.1
  - @backstage/config@1.0.8
  - @backstage/plugin-auth-node@0.2.17-next.0
  - @backstage-community/plugin-entity-feedback-common@0.1.1

## 0.1.5

### Patch Changes

- 5c1c10adac8f: Added support for the new backend system
- Updated dependencies
  - @backstage/backend-common@0.19.1
  - @backstage/backend-plugin-api@0.5.4
  - @backstage/catalog-client@1.4.3
  - @backstage/catalog-model@1.4.1
  - @backstage/config@1.0.8
  - @backstage/plugin-auth-node@0.2.16
  - @backstage-community/plugin-entity-feedback-common@0.1.1

## 0.1.5-next.0

### Patch Changes

- 5c1c10adac8f: Added support for the new backend system
- Updated dependencies
  - @backstage/backend-common@0.19.1-next.0
  - @backstage/backend-plugin-api@0.5.4-next.0
  - @backstage/catalog-client@1.4.3-next.0
  - @backstage/catalog-model@1.4.1-next.0
  - @backstage/config@1.0.8
  - @backstage/plugin-auth-node@0.2.16-next.0
  - @backstage-community/plugin-entity-feedback-common@0.1.1

## 0.1.4

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.0
  - @backstage/catalog-client@1.4.2
  - @backstage/catalog-model@1.4.0
  - @backstage/plugin-auth-node@0.2.15
  - @backstage/config@1.0.8
  - @backstage-community/plugin-entity-feedback-common@0.1.1

## 0.1.4-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.0-next.2
  - @backstage/catalog-model@1.4.0-next.1
  - @backstage/catalog-client@1.4.2-next.2
  - @backstage/config@1.0.7
  - @backstage/plugin-auth-node@0.2.15-next.2
  - @backstage-community/plugin-entity-feedback-common@0.1.1

## 0.1.4-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.0-next.1
  - @backstage/catalog-model@1.4.0-next.0
  - @backstage/plugin-auth-node@0.2.15-next.1
  - @backstage/catalog-client@1.4.2-next.1
  - @backstage/config@1.0.7
  - @backstage-community/plugin-entity-feedback-common@0.1.1

## 0.1.4-next.0

### Patch Changes

- Updated dependencies
  - @backstage/catalog-client@1.4.2-next.0
  - @backstage/backend-common@0.18.6-next.0
  - @backstage/config@1.0.7
  - @backstage/catalog-model@1.3.0
  - @backstage/plugin-auth-node@0.2.15-next.0
  - @backstage-community/plugin-entity-feedback-common@0.1.1

## 0.1.3

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.5
  - @backstage/plugin-auth-node@0.2.14
  - @backstage/catalog-client@1.4.1
  - @backstage/catalog-model@1.3.0
  - @backstage/config@1.0.7
  - @backstage-community/plugin-entity-feedback-common@0.1.1

## 0.1.3-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.5-next.1
  - @backstage/plugin-auth-node@0.2.14-next.1
  - @backstage/config@1.0.7

## 0.1.3-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.5-next.0
  - @backstage/plugin-auth-node@0.2.14-next.0
  - @backstage/catalog-client@1.4.1
  - @backstage/catalog-model@1.3.0
  - @backstage/config@1.0.7
  - @backstage-community/plugin-entity-feedback-common@0.1.1

## 0.1.2

### Patch Changes

- 7eba760e6f6: Added an endpoint to fetch anonymous aggregated results from an entity
- Updated dependencies
  - @backstage/backend-common@0.18.4
  - @backstage/catalog-client@1.4.1
  - @backstage-community/plugin-entity-feedback-common@0.1.1
  - @backstage/catalog-model@1.3.0
  - @backstage/plugin-auth-node@0.2.13
  - @backstage/config@1.0.7

## 0.1.2-next.3

### Patch Changes

- Updated dependencies
  - @backstage/catalog-model@1.3.0-next.0
  - @backstage/backend-common@0.18.4-next.2
  - @backstage/catalog-client@1.4.1-next.1
  - @backstage/config@1.0.7
  - @backstage/plugin-auth-node@0.2.13-next.2
  - @backstage-community/plugin-entity-feedback-common@0.1.1-next.0

## 0.1.2-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.4-next.2
  - @backstage/catalog-client@1.4.1-next.0
  - @backstage/catalog-model@1.2.1
  - @backstage/config@1.0.7
  - @backstage/plugin-auth-node@0.2.13-next.2
  - @backstage-community/plugin-entity-feedback-common@0.1.1-next.0

## 0.1.2-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.4-next.1
  - @backstage/catalog-client@1.4.0
  - @backstage/catalog-model@1.2.1
  - @backstage/config@1.0.7
  - @backstage/plugin-auth-node@0.2.13-next.1
  - @backstage-community/plugin-entity-feedback-common@0.1.1-next.0

## 0.1.2-next.0

### Patch Changes

- 7eba760e6f6: Added an endpoint to fetch anonymous aggregated results from an entity
- Updated dependencies
  - @backstage-community/plugin-entity-feedback-common@0.1.1-next.0
  - @backstage/backend-common@0.18.4-next.0
  - @backstage/config@1.0.7
  - @backstage/catalog-client@1.4.0
  - @backstage/catalog-model@1.2.1
  - @backstage/plugin-auth-node@0.2.13-next.0

## 0.1.1

### Patch Changes

- 52b0022dab7: Updated dependency `msw` to `^1.0.0`.
- Updated dependencies
  - @backstage/catalog-client@1.4.0
  - @backstage/plugin-auth-node@0.2.12
  - @backstage/backend-common@0.18.3
  - @backstage/catalog-model@1.2.1
  - @backstage/config@1.0.7
  - @backstage-community/plugin-entity-feedback-common@0.1.0

## 0.1.1-next.2

### Patch Changes

- Updated dependencies
  - @backstage/plugin-auth-node@0.2.12-next.2
  - @backstage/backend-common@0.18.3-next.2
  - @backstage/config@1.0.7-next.0

## 0.1.1-next.1

### Patch Changes

- 52b0022dab7: Updated dependency `msw` to `^1.0.0`.
- Updated dependencies
  - @backstage/backend-common@0.18.3-next.1
  - @backstage/catalog-client@1.4.0-next.1
  - @backstage/plugin-auth-node@0.2.12-next.1
  - @backstage/config@1.0.7-next.0
  - @backstage/catalog-model@1.2.1-next.1
  - @backstage-community/plugin-entity-feedback-common@0.1.0

## 0.1.1-next.0

### Patch Changes

- Updated dependencies
  - @backstage/catalog-client@1.4.0-next.0
  - @backstage/backend-common@0.18.3-next.0
  - @backstage/catalog-model@1.2.1-next.0
  - @backstage/config@1.0.6
  - @backstage/plugin-auth-node@0.2.12-next.0
  - @backstage-community/plugin-entity-feedback-common@0.1.0

## 0.1.0

### Minor Changes

- a3c86a7ed2: Implement entity feedback plugin, check out the `README.md` for more details!

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.2
  - @backstage-community/plugin-entity-feedback-common@0.1.0
  - @backstage/catalog-model@1.2.0
  - @backstage/catalog-client@1.3.1
  - @backstage/config@1.0.6
  - @backstage/plugin-auth-node@0.2.11
