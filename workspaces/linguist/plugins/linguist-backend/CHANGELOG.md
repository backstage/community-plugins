# @backstage-community/plugin-linguist-backend

## 0.17.0

### Minor Changes

- ec085f8: Backstage version bump to v1.41.1

### Patch Changes

- Updated dependencies [ec085f8]
  - @backstage-community/plugin-linguist-common@0.10.0

## 0.16.0

### Minor Changes

- b622118: Backstage version bump to v1.40.2

### Patch Changes

- Updated dependencies [b622118]
  - @backstage-community/plugin-linguist-common@0.9.0

## 0.15.0

### Minor Changes

- adc3ea9: Backstage version bump to v1.39.0

### Patch Changes

- Updated dependencies [adc3ea9]
  - @backstage-community/plugin-linguist-common@0.8.0

## 0.14.1

### Patch Changes

- 6c0f6ee: Update README links to point to community-plugins repository.

## 0.14.0

### Minor Changes

- 4f1b9a6: Backstage version bump to v1.38.1

### Patch Changes

- Updated dependencies [4f1b9a6]
  - @backstage-community/plugin-linguist-common@0.7.0

## 0.13.0

### Minor Changes

- 10ae338: Backstage version bump to v1.37.0

### Patch Changes

- Updated dependencies [10ae338]
  - @backstage-community/plugin-linguist-common@0.6.0

## 0.12.0

### Minor Changes

- 4a2f2c1: Backstage version bump to v1.36.1

### Patch Changes

- Updated dependencies [4a2f2c1]
  - @backstage-community/plugin-linguist-common@0.5.0

## 0.11.1

### Patch Changes

- 208e250: Updated dependency `@types/uuid` to `^10.0.0`.

## 0.11.0

### Minor Changes

- cf27ad1: Backstage version bump to v1.35.1

### Patch Changes

- Updated dependencies [cf27ad1]
  - @backstage-community/plugin-linguist-common@0.4.0

## 0.10.0

### Minor Changes

- 8585c65: Added openapi spec for linguist backend

## 0.9.0

### Minor Changes

- aef63f8: Backstage version bump to v1.34.1

### Patch Changes

- Updated dependencies [aef63f8]
  - @backstage-community/plugin-linguist-common@0.3.0

## 0.8.0

### Minor Changes

- 067af9a: Backstage version bump to v1.33.5

### Patch Changes

- Updated dependencies [067af9a]
  - @backstage-community/plugin-linguist-common@0.2.0

## 0.7.0

### Minor Changes

- 9602620: **BREAKING** Removed support for what is known as the legacy backend, please use the New Backend System.

## 0.6.4

### Patch Changes

- 17ff948: Backstage version bump to v1.32.2
- Updated dependencies [17ff948]
  - @backstage-community/plugin-linguist-common@0.1.10

## 0.6.3

### Patch Changes

- 3fad54b: Fixes custom linguistJs options

## 0.6.2

### Patch Changes

- 4f08a49: Backstage version bump to v1.31.1
- Updated dependencies [4f08a49]
  - @backstage-community/plugin-linguist-common@0.1.9

## 0.6.1

### Patch Changes

- 932d9e6: Marked `createRouter`, `createRouterFromConfig`, `RouterOptions`, and `PluginOptions` as deprecated, to be removed soon after the Backstage `1.32.0` release in October

## 0.6.0

### Minor Changes

- 3a4d799: **BREAKING** This change removes the deprecated `LinguistTagsProcessor` from `@backstage-community/plugin-linguist-backend`. It also removes the export of `LinguistTagsProcessor` from `@backstage-community/plugin-catalog-backend-module-linguist-tags-processor`. Please install this processor using [the New Backend System setup](https://github.com/backstage/community-plugins/tree/main/workspaces/linguist/plugins/catalog-backend-module-linguist-tags-processor#setup), which is now the default.

## 0.5.23

### Patch Changes

- 6021ae7: Backstage version bump to v1.30.2
- Updated dependencies [6021ae7]
  - @backstage-community/plugin-linguist-common@0.1.8

## 0.5.22

### Patch Changes

- ae2ee8a: Updated dependency `@types/supertest` to `^6.0.0`.
  Updated dependency `supertest` to `^7.0.0`.

## 0.5.21

### Patch Changes

- 78129a3: Removed code marked as deprecated in the upstream Backstage project

## 0.5.20

### Patch Changes

- fced742: version:bump to v1.29.1
- Updated dependencies [fced742]
  - @backstage-community/plugin-linguist-common@0.1.7

## 0.5.19

### Patch Changes

- dd19841: Added package metadata
- 3651de6: Added new dedicated module for the Linguist Tags Processor and deprecated the version in the Linguist Backend
- Updated dependencies [dd19841]
  - @backstage-community/plugin-linguist-common@0.1.6

## 0.5.18

### Patch Changes

- fa1553e: Backstage v1.28.4 version bump
- Updated dependencies [fa1553e]
  - @backstage-community/plugin-linguist-common@0.1.5

## 0.5.17

### Patch Changes

- 7b77065: Backstage `1.27.6` version bump
- 468799c: Fixed how the `age` config value was being pulled in the router when using the new backend system
- 9bff05a: adds support for supplying a prefix to tags created by the LinguistTagsProcessor
- 295c71a: Updated dependencies
- Updated dependencies [7b77065]
- Updated dependencies [295c71a]
  - @backstage-community/plugin-linguist-common@0.1.4

## 0.5.16

### Patch Changes

- afff3cf: Migrated from the [backstage/backstage](https://github.com/backstage/backstage) monorepo.
- Updated dependencies [afff3cf]
  - @backstage-community/plugin-linguist-common@0.1.3

## 0.5.15

### Patch Changes

- d5a1fe1: Replaced winston logger with `LoggerService`
- Updated dependencies
  - @backstage/backend-common@0.21.7
  - @backstage/backend-plugin-api@0.6.17
  - @backstage/backend-tasks@0.5.22
  - @backstage/catalog-client@1.6.4
  - @backstage/plugin-catalog-node@1.11.1
  - @backstage/catalog-model@1.4.5
  - @backstage/config@1.2.0
  - @backstage/errors@1.2.4
  - @backstage/types@1.1.1
  - @backstage-community/plugin-linguist-common@0.1.2

## 0.5.15-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.21.7-next.1
  - @backstage/backend-plugin-api@0.6.17-next.1
  - @backstage/catalog-client@1.6.4-next.0
  - @backstage/backend-tasks@0.5.22-next.1
  - @backstage/catalog-model@1.4.5
  - @backstage/config@1.2.0
  - @backstage/errors@1.2.4
  - @backstage/types@1.1.1
  - @backstage/plugin-catalog-node@1.11.1-next.1
  - @backstage-community/plugin-linguist-common@0.1.2

## 0.5.15-next.0

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
  - @backstage/plugin-catalog-node@1.11.1-next.0
  - @backstage-community/plugin-linguist-common@0.1.2

## 0.5.14

### Patch Changes

- Updated dependencies
  - @backstage/plugin-catalog-node@1.11.0
  - @backstage/catalog-client@1.6.3
  - @backstage/backend-common@0.21.6
  - @backstage/backend-plugin-api@0.6.16
  - @backstage/backend-tasks@0.5.21
  - @backstage/catalog-model@1.4.5
  - @backstage/config@1.2.0
  - @backstage/errors@1.2.4
  - @backstage/types@1.1.1
  - @backstage-community/plugin-linguist-common@0.1.2

## 0.5.13

### Patch Changes

- Updated dependencies
  - @backstage/plugin-catalog-node@1.10.0
  - @backstage/catalog-client@1.6.2
  - @backstage/backend-common@0.21.5
  - @backstage/backend-tasks@0.5.20
  - @backstage/backend-plugin-api@0.6.15
  - @backstage/catalog-model@1.4.5
  - @backstage/config@1.2.0
  - @backstage/errors@1.2.4
  - @backstage/types@1.1.1
  - @backstage-community/plugin-linguist-common@0.1.2

## 0.5.12

### Patch Changes

- Updated dependencies
  - @backstage/plugin-catalog-node@1.9.0

## 0.5.11

### Patch Changes

- 61ff58f: Migrated to support new auth services.
- 4467036: Allow unauthenticated access to health check endpoint.
- 786c9c4: Updated dependency `luxon` to `^3.0.0`.
- 0fb419b: Updated dependency `uuid` to `^9.0.0`.
  Updated dependency `@types/uuid` to `^9.0.0`.
- 051fda1: Removed unused `dependencies` and `devDependencies` identified in Knip Report
- Updated dependencies
  - @backstage/backend-common@0.21.4
  - @backstage/config@1.2.0
  - @backstage/errors@1.2.4
  - @backstage/backend-plugin-api@0.6.14
  - @backstage/plugin-catalog-node@1.8.0
  - @backstage/catalog-client@1.6.1
  - @backstage/backend-tasks@0.5.19
  - @backstage/catalog-model@1.4.5
  - @backstage/types@1.1.1
  - @backstage-community/plugin-linguist-common@0.1.2

## 0.5.11-next.2

### Patch Changes

- 051fda1: Removed unused `dependencies` and `devDependencies` identified in Knip Report
- Updated dependencies
  - @backstage/catalog-client@1.6.1-next.1
  - @backstage/backend-common@0.21.4-next.2
  - @backstage/plugin-catalog-node@1.8.0-next.2
  - @backstage/backend-plugin-api@0.6.14-next.2
  - @backstage/backend-tasks@0.5.19-next.2
  - @backstage/catalog-model@1.4.5-next.0
  - @backstage/config@1.2.0-next.1
  - @backstage/errors@1.2.4-next.0
  - @backstage/types@1.1.1
  - @backstage-community/plugin-linguist-common@0.1.2

## 0.5.11-next.1

### Patch Changes

- Updated dependencies
  - @backstage/config@1.2.0-next.1
  - @backstage/backend-common@0.21.4-next.1
  - @backstage/backend-plugin-api@0.6.14-next.1
  - @backstage/backend-tasks@0.5.19-next.1
  - @backstage/plugin-auth-node@0.4.9-next.1
  - @backstage/catalog-client@1.6.1-next.0
  - @backstage/catalog-model@1.4.5-next.0
  - @backstage/errors@1.2.4-next.0
  - @backstage/types@1.1.1
  - @backstage/plugin-catalog-node@1.8.0-next.1
  - @backstage-community/plugin-linguist-common@0.1.2

## 0.5.10-next.0

### Patch Changes

- 61ff58f: Migrated to support new auth services.
- 786c9c4: Updated dependency `luxon` to `^3.0.0`.
- 0fb419b: Updated dependency `uuid` to `^9.0.0`.
  Updated dependency `@types/uuid` to `^9.0.0`.
- Updated dependencies
  - @backstage/backend-common@0.21.3-next.0
  - @backstage/plugin-auth-node@0.4.8-next.0
  - @backstage/errors@1.2.4-next.0
  - @backstage/backend-plugin-api@0.6.13-next.0
  - @backstage/plugin-catalog-node@1.8.0-next.0
  - @backstage/backend-tasks@0.5.18-next.0
  - @backstage/catalog-client@1.6.1-next.0
  - @backstage/catalog-model@1.4.5-next.0
  - @backstage/config@1.1.2-next.0
  - @backstage/types@1.1.1
  - @backstage-community/plugin-linguist-common@0.1.2

## 0.5.7

### Patch Changes

- b64ce5a: Updated New Backend System instructions to use default import
- 9aac2b0: Use `--cwd` as the first `yarn` argument
- 6bb6f3e: Updated dependency `fs-extra` to `^11.2.0`.
  Updated dependency `@types/fs-extra` to `^11.0.0`.
- Updated dependencies
  - @backstage/backend-common@0.21.0
  - @backstage/plugin-auth-node@0.4.4
  - @backstage/backend-plugin-api@0.6.10
  - @backstage/backend-tasks@0.5.15
  - @backstage/catalog-model@1.4.4
  - @backstage/catalog-client@1.6.0
  - @backstage/plugin-catalog-node@1.7.0
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3
  - @backstage/types@1.1.1
  - @backstage-community/plugin-linguist-common@0.1.2

## 0.5.7-next.3

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.21.0-next.3
  - @backstage/backend-tasks@0.5.15-next.3
  - @backstage/plugin-catalog-node@1.6.2-next.3
  - @backstage/plugin-auth-node@0.4.4-next.3
  - @backstage/backend-plugin-api@0.6.10-next.3
  - @backstage/catalog-client@1.6.0-next.1
  - @backstage/catalog-model@1.4.4-next.0
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3
  - @backstage/types@1.1.1
  - @backstage-community/plugin-linguist-common@0.1.2

## 0.5.7-next.2

### Patch Changes

- 9aac2b0: Use `--cwd` as the first `yarn` argument
- Updated dependencies
  - @backstage/backend-common@0.21.0-next.2
  - @backstage/backend-plugin-api@0.6.10-next.2
  - @backstage/backend-tasks@0.5.15-next.2
  - @backstage/plugin-auth-node@0.4.4-next.2
  - @backstage/plugin-catalog-node@1.6.2-next.2
  - @backstage/config@1.1.1
  - @backstage/catalog-client@1.6.0-next.1
  - @backstage/catalog-model@1.4.4-next.0
  - @backstage/errors@1.2.3
  - @backstage/types@1.1.1
  - @backstage-community/plugin-linguist-common@0.1.2

## 0.5.7-next.1

### Patch Changes

- Updated dependencies
  - @backstage/catalog-model@1.4.4-next.0
  - @backstage/catalog-client@1.6.0-next.1
  - @backstage/backend-plugin-api@0.6.10-next.1
  - @backstage/backend-common@0.21.0-next.1
  - @backstage/backend-tasks@0.5.15-next.1
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3
  - @backstage/types@1.1.1
  - @backstage/plugin-auth-node@0.4.4-next.1
  - @backstage/plugin-catalog-node@1.6.2-next.1
  - @backstage-community/plugin-linguist-common@0.1.2

## 0.5.7-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.21.0-next.0
  - @backstage/catalog-client@1.6.0-next.0
  - @backstage/backend-tasks@0.5.15-next.0
  - @backstage/plugin-auth-node@0.4.4-next.0
  - @backstage/plugin-catalog-node@1.6.2-next.0
  - @backstage/backend-plugin-api@0.6.10-next.0
  - @backstage/catalog-model@1.4.3
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3
  - @backstage/types@1.1.1
  - @backstage-community/plugin-linguist-common@0.1.2

## 0.5.6

### Patch Changes

- 4016f21: Remove some unused dependencies
- Updated dependencies
  - @backstage/backend-common@0.20.1
  - @backstage/catalog-client@1.5.2
  - @backstage/backend-plugin-api@0.6.9
  - @backstage/plugin-catalog-node@1.6.1
  - @backstage/backend-tasks@0.5.14
  - @backstage/plugin-auth-node@0.4.3
  - @backstage/catalog-model@1.4.3
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3
  - @backstage/types@1.1.1
  - @backstage-community/plugin-linguist-common@0.1.2

## 0.5.6-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-plugin-api@0.6.9-next.2
  - @backstage/backend-common@0.20.1-next.2
  - @backstage/plugin-auth-node@0.4.3-next.2
  - @backstage/plugin-catalog-node@1.6.1-next.2
  - @backstage/backend-tasks@0.5.14-next.2

## 0.5.6-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.20.1-next.1
  - @backstage/config@1.1.1
  - @backstage/backend-tasks@0.5.14-next.1
  - @backstage/plugin-auth-node@0.4.3-next.1
  - @backstage/backend-plugin-api@0.6.9-next.1
  - @backstage/catalog-client@1.5.2-next.0
  - @backstage/catalog-model@1.4.3
  - @backstage/errors@1.2.3
  - @backstage/types@1.1.1
  - @backstage/plugin-catalog-node@1.6.1-next.1
  - @backstage-community/plugin-linguist-common@0.1.2

## 0.5.6-next.0

### Patch Changes

- 4016f21: Remove some unused dependencies
- Updated dependencies
  - @backstage/backend-common@0.20.1-next.0
  - @backstage/catalog-client@1.5.2-next.0
  - @backstage/plugin-catalog-node@1.6.1-next.0
  - @backstage/backend-plugin-api@0.6.9-next.0
  - @backstage/backend-tasks@0.5.14-next.0
  - @backstage/catalog-model@1.4.3
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3
  - @backstage/types@1.1.1
  - @backstage/plugin-auth-node@0.4.3-next.0
  - @backstage-community/plugin-linguist-common@0.1.2

## 0.5.5

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.20.0
  - @backstage/plugin-catalog-node@1.6.0
  - @backstage/catalog-client@1.5.0
  - @backstage/backend-tasks@0.5.13
  - @backstage/plugin-auth-node@0.4.2
  - @backstage/backend-plugin-api@0.6.8
  - @backstage/catalog-model@1.4.3
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3
  - @backstage/types@1.1.1
  - @backstage-community/plugin-linguist-common@0.1.2

## 0.5.5-next.3

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.20.0-next.3
  - @backstage/backend-plugin-api@0.6.8-next.3
  - @backstage/backend-tasks@0.5.13-next.3
  - @backstage/catalog-client@1.5.0-next.1
  - @backstage/catalog-model@1.4.3
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3
  - @backstage/types@1.1.1
  - @backstage/plugin-auth-node@0.4.2-next.3
  - @backstage/plugin-catalog-node@1.6.0-next.3
  - @backstage-community/plugin-linguist-common@0.1.2

## 0.5.5-next.2

### Patch Changes

- Updated dependencies
  - @backstage/plugin-catalog-node@1.6.0-next.2
  - @backstage/backend-common@0.20.0-next.2
  - @backstage/plugin-auth-node@0.4.2-next.2
  - @backstage/catalog-client@1.5.0-next.1
  - @backstage/backend-plugin-api@0.6.8-next.2
  - @backstage/backend-tasks@0.5.13-next.2
  - @backstage/catalog-model@1.4.3
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3
  - @backstage/types@1.1.1
  - @backstage-community/plugin-linguist-common@0.1.2

## 0.5.5-next.1

### Patch Changes

- Updated dependencies
  - @backstage/catalog-client@1.5.0-next.0
  - @backstage/backend-common@0.20.0-next.1
  - @backstage/backend-plugin-api@0.6.8-next.1
  - @backstage/backend-tasks@0.5.13-next.1
  - @backstage/catalog-model@1.4.3
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3
  - @backstage/types@1.1.1
  - @backstage/plugin-auth-node@0.4.2-next.1
  - @backstage/plugin-catalog-node@1.5.1-next.1
  - @backstage-community/plugin-linguist-common@0.1.2

## 0.5.5-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.20.0-next.0
  - @backstage/backend-tasks@0.5.13-next.0
  - @backstage/plugin-auth-node@0.4.2-next.0
  - @backstage/plugin-catalog-node@1.5.1-next.0
  - @backstage/backend-plugin-api@0.6.8-next.0
  - @backstage/catalog-client@1.4.6
  - @backstage/catalog-model@1.4.3
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3
  - @backstage/types@1.1.1
  - @backstage-community/plugin-linguist-common@0.1.2

## 0.5.4

### Patch Changes

- 013611b42e: `knex` has been bumped to major version 3 and `better-sqlite3` to major version 9, which deprecate node 16 support.
- Updated dependencies
  - @backstage/plugin-catalog-node@1.5.0
  - @backstage/backend-common@0.19.9
  - @backstage/backend-plugin-api@0.6.7
  - @backstage/backend-tasks@0.5.12
  - @backstage/catalog-client@1.4.6
  - @backstage/catalog-model@1.4.3
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3
  - @backstage/types@1.1.1
  - @backstage/plugin-auth-node@0.4.1
  - @backstage-community/plugin-linguist-common@0.1.2

## 0.5.4-next.2

### Patch Changes

- [#20570](https://github.com/backstage/backstage/pull/20570) [`013611b42e`](https://github.com/backstage/backstage/commit/013611b42ed457fefa9bb85fddf416cf5e0c1f76) Thanks [@freben](https://github.com/freben)! - `knex` has been bumped to major version 3 and `better-sqlite3` to major version 9, which deprecate node 16 support.

- Updated dependencies
  - @backstage/backend-plugin-api@0.6.7-next.2
  - @backstage/backend-common@0.19.9-next.2
  - @backstage/backend-tasks@0.5.12-next.2
  - @backstage/plugin-auth-node@0.4.1-next.2
  - @backstage/plugin-catalog-node@1.5.0-next.2

## 0.5.4-next.1

### Patch Changes

- Updated dependencies
  - @backstage/plugin-catalog-node@1.5.0-next.1
  - @backstage/backend-common@0.19.9-next.1
  - @backstage/backend-tasks@0.5.12-next.1
  - @backstage/plugin-auth-node@0.4.1-next.1
  - @backstage/backend-plugin-api@0.6.7-next.1
  - @backstage/catalog-client@1.4.5
  - @backstage/catalog-model@1.4.3
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3
  - @backstage/types@1.1.1
  - @backstage-community/plugin-linguist-common@0.1.2

## 0.5.4-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.9-next.0
  - @backstage/backend-plugin-api@0.6.7-next.0
  - @backstage/backend-tasks@0.5.12-next.0
  - @backstage/catalog-client@1.4.5
  - @backstage/catalog-model@1.4.3
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3
  - @backstage/types@1.1.1
  - @backstage/plugin-auth-node@0.4.1-next.0
  - @backstage/plugin-catalog-node@1.4.8-next.0
  - @backstage-community/plugin-linguist-common@0.1.2

## 0.5.3

### Patch Changes

- Updated dependencies
  - @backstage/backend-tasks@0.5.11
  - @backstage/backend-common@0.19.8
  - @backstage/plugin-catalog-node@1.4.7
  - @backstage/plugin-auth-node@0.4.0
  - @backstage/catalog-model@1.4.3
  - @backstage/errors@1.2.3
  - @backstage/backend-plugin-api@0.6.6
  - @backstage/catalog-client@1.4.5
  - @backstage/config@1.1.1
  - @backstage/types@1.1.1
  - @backstage-community/plugin-linguist-common@0.1.2

## 0.5.3-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.8-next.2
  - @backstage/plugin-auth-node@0.4.0-next.2
  - @backstage/catalog-model@1.4.3-next.0
  - @backstage/errors@1.2.3-next.0
  - @backstage/backend-tasks@0.5.11-next.2
  - @backstage/plugin-catalog-node@1.4.7-next.2
  - @backstage/backend-plugin-api@0.6.6-next.2
  - @backstage/catalog-client@1.4.5-next.0
  - @backstage/config@1.1.1-next.0
  - @backstage/types@1.1.1
  - @backstage-community/plugin-linguist-common@0.1.2

## 0.5.2-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-tasks@0.5.10-next.1
  - @backstage/plugin-catalog-node@1.4.6-next.1
  - @backstage/backend-common@0.19.7-next.1
  - @backstage/backend-plugin-api@0.6.5-next.1
  - @backstage/plugin-auth-node@0.3.2-next.1
  - @backstage/config@1.1.0
  - @backstage/catalog-client@1.4.4
  - @backstage/catalog-model@1.4.2
  - @backstage/errors@1.2.2
  - @backstage/types@1.1.1
  - @backstage-community/plugin-linguist-common@0.1.2

## 0.5.2-next.0

### Patch Changes

- Updated dependencies
  - @backstage/plugin-auth-node@0.3.2-next.0
  - @backstage/backend-common@0.19.7-next.0
  - @backstage/config@1.1.0
  - @backstage/backend-plugin-api@0.6.5-next.0
  - @backstage/backend-tasks@0.5.10-next.0
  - @backstage/catalog-client@1.4.4
  - @backstage/catalog-model@1.4.2
  - @backstage/errors@1.2.2
  - @backstage/types@1.1.1
  - @backstage/plugin-catalog-node@1.4.6-next.0
  - @backstage-community/plugin-linguist-common@0.1.2

## 0.5.0

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

- b2de501bda31: When creating the router using `createRouterFromConfig` or using the plugin for the new backend system the `linguist.useSourceLocation` configuration is now optional.
- cfc3ca6ce060: Changes needed to support MySQL
- Updated dependencies
  - @backstage/backend-tasks@0.5.8
  - @backstage/backend-common@0.19.5
  - @backstage/plugin-auth-node@0.3.0
  - @backstage/config@1.1.0
  - @backstage/catalog-client@1.4.4
  - @backstage/catalog-model@1.4.2
  - @backstage/errors@1.2.2
  - @backstage-community/plugin-linguist-common@0.1.2
  - @backstage/types@1.1.1
  - @backstage/backend-plugin-api@0.6.3
  - @backstage/plugin-catalog-node@1.4.4

## 0.5.0-next.3

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
  - @backstage/errors@1.2.2-next.0
  - @backstage-community/plugin-linguist-common@0.1.2-next.0
  - @backstage/types@1.1.1-next.0
  - @backstage/backend-plugin-api@0.6.3-next.3
  - @backstage/backend-common@0.19.5-next.3
  - @backstage/backend-tasks@0.5.8-next.3
  - @backstage/plugin-auth-node@0.3.0-next.3
  - @backstage/plugin-catalog-node@1.4.4-next.3

## 0.4.3-next.2

### Patch Changes

- Updated dependencies
  - @backstage/config@1.1.0-next.1
  - @backstage/backend-tasks@0.5.8-next.2
  - @backstage/backend-common@0.19.5-next.2
  - @backstage/plugin-auth-node@0.3.0-next.2
  - @backstage/plugin-catalog-node@1.4.4-next.2
  - @backstage/backend-plugin-api@0.6.3-next.2
  - @backstage/catalog-model@1.4.2-next.1
  - @backstage/catalog-client@1.4.4-next.1
  - @backstage/errors@1.2.1
  - @backstage/types@1.1.0
  - @backstage-community/plugin-linguist-common@0.1.1

## 0.4.3-next.1

### Patch Changes

- Updated dependencies
  - @backstage/config@1.1.0-next.0
  - @backstage/backend-tasks@0.5.8-next.1
  - @backstage/backend-common@0.19.5-next.1
  - @backstage/backend-plugin-api@0.6.3-next.1
  - @backstage/catalog-model@1.4.2-next.0
  - @backstage/plugin-auth-node@0.3.0-next.1
  - @backstage/plugin-catalog-node@1.4.4-next.1
  - @backstage/catalog-client@1.4.4-next.0
  - @backstage/errors@1.2.1
  - @backstage/types@1.1.0
  - @backstage-community/plugin-linguist-common@0.1.1

## 0.4.2-next.0

### Patch Changes

- b2de501bda31: When creating the router using `createRouterFromConfig` or using the plugin for the new backend system the `linguist.useSourceLocation` configuration is now optional.
- cfc3ca6ce060: Changes needed to support MySQL
- Updated dependencies
  - @backstage/plugin-auth-node@0.3.0-next.0
  - @backstage/backend-common@0.19.4-next.0
  - @backstage/backend-tasks@0.5.7-next.0
  - @backstage/backend-plugin-api@0.6.2-next.0
  - @backstage/catalog-client@1.4.3
  - @backstage/catalog-model@1.4.1
  - @backstage/config@1.0.8
  - @backstage/errors@1.2.1
  - @backstage/types@1.1.0
  - @backstage/plugin-catalog-node@1.4.3-next.0
  - @backstage-community/plugin-linguist-common@0.1.1

## 0.4.0

### Minor Changes

- d440f1dd0e72: Adds a processor to the linguist backend which can automatically add language tags to entities
- 0896d85d5ab5: **BREAKING**: Removed the alpha export plugin options from exported `linguistPlugin()` (used by the new backend system) in favour of static config.

### Patch Changes

- 12a8c94eda8d: Add package repository and homepage metadata
- ca5e591cb86a: Fixed bug in LinguistBackendClient.ts file where if the linguistJsOptions is specified and sent over to the linguist-js package it would get changed (another attribute would be added) causing future entities of the batch to fail with an error
- Updated dependencies
  - @backstage/backend-common@0.19.2
  - @backstage/backend-plugin-api@0.6.0
  - @backstage-community/plugin-linguist-common@0.1.1
  - @backstage/plugin-catalog-node@1.4.1
  - @backstage/plugin-auth-node@0.2.17
  - @backstage/backend-tasks@0.5.5
  - @backstage/catalog-client@1.4.3
  - @backstage/catalog-model@1.4.1
  - @backstage/config@1.0.8
  - @backstage/errors@1.2.1
  - @backstage/types@1.1.0

## 0.4.0-next.2

### Minor Changes

- d440f1dd0e72: Adds a processor to the linguist backend which can automatically add language tags to entities

### Patch Changes

- Updated dependencies
  - @backstage-community/plugin-linguist-common@0.1.1-next.1
  - @backstage/backend-plugin-api@0.6.0-next.2
  - @backstage/backend-tasks@0.5.5-next.2
  - @backstage/backend-common@0.19.2-next.2
  - @backstage/plugin-catalog-node@1.4.1-next.2
  - @backstage/plugin-auth-node@0.2.17-next.2

## 0.3.2-next.1

### Patch Changes

- 12a8c94eda8d: Add package repository and homepage metadata
- Updated dependencies
  - @backstage/backend-common@0.19.2-next.1
  - @backstage-community/plugin-linguist-common@0.1.1-next.0
  - @backstage/plugin-auth-node@0.2.17-next.1
  - @backstage/backend-plugin-api@0.6.0-next.1
  - @backstage/backend-tasks@0.5.5-next.1
  - @backstage/catalog-client@1.4.3
  - @backstage/catalog-model@1.4.1
  - @backstage/config@1.0.8
  - @backstage/errors@1.2.1
  - @backstage/types@1.1.0

## 0.3.2-next.0

### Patch Changes

- ca5e591cb86a: Fixed bug in LinguistBackendClient.ts file where if the linguistJsOptions is specified and sent over to the linguist-js package it would get changed (another attribute would be added) causing future entities of the batch to fail with an error
- Updated dependencies
  - @backstage/backend-common@0.19.2-next.0
  - @backstage/backend-plugin-api@0.5.5-next.0
  - @backstage/backend-tasks@0.5.5-next.0
  - @backstage/catalog-client@1.4.3
  - @backstage/catalog-model@1.4.1
  - @backstage/config@1.0.8
  - @backstage/errors@1.2.1
  - @backstage/types@1.1.0
  - @backstage/plugin-auth-node@0.2.17-next.0
  - @backstage-community/plugin-linguist-common@0.1.0

## 0.3.1

### Patch Changes

- ae261e79d256: Added alpha support for the [new backend system](https://backstage.io/docs/backend-system/)
- Updated dependencies
  - @backstage/errors@1.2.1
  - @backstage/backend-common@0.19.1
  - @backstage/backend-plugin-api@0.5.4
  - @backstage/backend-tasks@0.5.4
  - @backstage/catalog-client@1.4.3
  - @backstage/catalog-model@1.4.1
  - @backstage/config@1.0.8
  - @backstage/types@1.1.0
  - @backstage/plugin-auth-node@0.2.16
  - @backstage-community/plugin-linguist-common@0.1.0

## 0.3.1-next.1

### Patch Changes

- ae261e79d256: Added alpha support for the [new backend system](https://backstage.io/docs/backend-system/)
- Updated dependencies
  - @backstage/config@1.0.8

## 0.3.1-next.0

### Patch Changes

- Updated dependencies
  - @backstage/errors@1.2.1-next.0
  - @backstage/backend-common@0.19.1-next.0
  - @backstage/backend-tasks@0.5.4-next.0
  - @backstage/catalog-client@1.4.3-next.0
  - @backstage/catalog-model@1.4.1-next.0
  - @backstage/config@1.0.8
  - @backstage/types@1.1.0
  - @backstage/plugin-auth-node@0.2.16-next.0
  - @backstage-community/plugin-linguist-common@0.1.0

## 0.3.0

### Minor Changes

- bbf91840a52a: **BREAKING**: Removed public constructor from `LinguistBackendApi`. Removed export of `LinguistBackendDatabase` and `LinguistBackendStore`

  Several improvements to the Linguist backend have been made:

  - Added tests for the `LinguistBackendDatabase` and `LinguistBackendApi`
  - Added support for using SQLite as a database, helpful for local development
  - Removed the default from the `processes_date` column
  - Converted the `LinguistBackendApi` into an Interface
  - Added the `LinguistBackendClient` which implements the `LinguistBackendApi` Interface
  - Unprocessed entities will get processed before stale entities
  - Entities in the Linguist database but not in the Catalog anymore will be deleted
  - Improved the README's headings

### Patch Changes

- e39c3829bbd4: Fix: CatalogClient call without token
- 3d11596a72b5: Update plugin installation docs to be more consistent across documentations
- Updated dependencies
  - @backstage/backend-common@0.19.0
  - @backstage/catalog-client@1.4.2
  - @backstage/types@1.1.0
  - @backstage/catalog-model@1.4.0
  - @backstage/errors@1.2.0
  - @backstage/backend-tasks@0.5.3
  - @backstage/plugin-auth-node@0.2.15
  - @backstage/config@1.0.8
  - @backstage-community/plugin-linguist-common@0.1.0

## 0.3.0-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.0-next.2
  - @backstage/catalog-model@1.4.0-next.1
  - @backstage/backend-tasks@0.5.3-next.2
  - @backstage/catalog-client@1.4.2-next.2
  - @backstage/config@1.0.7
  - @backstage/errors@1.2.0-next.0
  - @backstage/types@1.0.2
  - @backstage/plugin-auth-node@0.2.15-next.2
  - @backstage-community/plugin-linguist-common@0.1.0

## 0.3.0-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.0-next.1
  - @backstage/errors@1.2.0-next.0
  - @backstage/catalog-model@1.4.0-next.0
  - @backstage/backend-tasks@0.5.3-next.1
  - @backstage/plugin-auth-node@0.2.15-next.1
  - @backstage/catalog-client@1.4.2-next.1
  - @backstage/config@1.0.7
  - @backstage/types@1.0.2
  - @backstage-community/plugin-linguist-common@0.1.0

## 0.3.0-next.0

### Minor Changes

- bbf91840a52a: **BREAKING**: Removed public constructor from `LinguistBackendApi`. Removed export of `LinguistBackendDatabase` and `LinguistBackendStore`

  Several improvements to the Linguist backend have been made:

  - Added tests for the `LinguistBackendDatabase` and `LinguistBackendApi`
  - Added support for using SQLite as a database, helpful for local development
  - Removed the default from the `processes_date` column
  - Converted the `LinguistBackendApi` into an Interface
  - Added the `LinguistBackendClient` which implements the `LinguistBackendApi` Interface
  - Unprocessed entities will get processed before stale entities
  - Entities in the Linguist database but not in the Catalog anymore will be deleted
  - Improved the README's headings

### Patch Changes

- 3d11596a72b5: Update plugin installation docs to be more consistent across documentations
- Updated dependencies
  - @backstage/catalog-client@1.4.2-next.0
  - @backstage/backend-common@0.18.6-next.0
  - @backstage/config@1.0.7
  - @backstage/backend-tasks@0.5.3-next.0
  - @backstage/catalog-model@1.3.0
  - @backstage/errors@1.1.5
  - @backstage/types@1.0.2
  - @backstage/plugin-auth-node@0.2.15-next.0
  - @backstage-community/plugin-linguist-common@0.1.0

## 0.2.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.5
  - @backstage/backend-tasks@0.5.2
  - @backstage/plugin-auth-node@0.2.14
  - @backstage/catalog-client@1.4.1
  - @backstage/catalog-model@1.3.0
  - @backstage/config@1.0.7
  - @backstage/errors@1.1.5
  - @backstage/types@1.0.2
  - @backstage-community/plugin-linguist-common@0.1.0

## 0.2.2-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.5-next.1
  - @backstage/backend-tasks@0.5.2-next.1
  - @backstage/plugin-auth-node@0.2.14-next.1
  - @backstage/config@1.0.7

## 0.2.2-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.5-next.0
  - @backstage/backend-tasks@0.5.2-next.0
  - @backstage/plugin-auth-node@0.2.14-next.0
  - @backstage/catalog-client@1.4.1
  - @backstage/catalog-model@1.3.0
  - @backstage/config@1.0.7
  - @backstage/errors@1.1.5
  - @backstage/types@1.0.2
  - @backstage-community/plugin-linguist-common@0.1.0

## 0.2.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.4
  - @backstage/catalog-client@1.4.1
  - @backstage/backend-tasks@0.5.1
  - @backstage/catalog-model@1.3.0
  - @backstage/plugin-auth-node@0.2.13
  - @backstage/config@1.0.7
  - @backstage/errors@1.1.5
  - @backstage/types@1.0.2
  - @backstage-community/plugin-linguist-common@0.1.0

## 0.2.1-next.3

### Patch Changes

- Updated dependencies
  - @backstage/catalog-model@1.3.0-next.0
  - @backstage/backend-common@0.18.4-next.2
  - @backstage/backend-tasks@0.5.1-next.2
  - @backstage/catalog-client@1.4.1-next.1
  - @backstage/config@1.0.7
  - @backstage/errors@1.1.5
  - @backstage/types@1.0.2
  - @backstage/plugin-auth-node@0.2.13-next.2
  - @backstage-community/plugin-linguist-common@0.1.0

## 0.2.1-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.4-next.2
  - @backstage/catalog-client@1.4.1-next.0
  - @backstage/backend-tasks@0.5.1-next.2
  - @backstage/catalog-model@1.2.1
  - @backstage/config@1.0.7
  - @backstage/errors@1.1.5
  - @backstage/types@1.0.2
  - @backstage/plugin-auth-node@0.2.13-next.2
  - @backstage-community/plugin-linguist-common@0.1.0

## 0.2.1-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-tasks@0.5.1-next.1
  - @backstage/backend-common@0.18.4-next.1
  - @backstage/catalog-client@1.4.0
  - @backstage/catalog-model@1.2.1
  - @backstage/config@1.0.7
  - @backstage/errors@1.1.5
  - @backstage/types@1.0.2
  - @backstage/plugin-auth-node@0.2.13-next.1
  - @backstage-community/plugin-linguist-common@0.1.0

## 0.2.1-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.4-next.0
  - @backstage/config@1.0.7
  - @backstage/backend-tasks@0.5.1-next.0
  - @backstage/catalog-client@1.4.0
  - @backstage/catalog-model@1.2.1
  - @backstage/errors@1.1.5
  - @backstage/types@1.0.2
  - @backstage/plugin-auth-node@0.2.13-next.0
  - @backstage-community/plugin-linguist-common@0.1.0

## 0.2.0

### Minor Changes

- 4a1c318853d: **BREAKING** The linguist-backend `createRouter` now requires that the `tokenManger` is passed to the router.

### Patch Changes

- 8a298b47240: Added support for linguist-js options using the linguistJSOptions in the plugin, the available config can be found [here](https://www.npmjs.com/package/linguist-js#API).
- 52b0022dab7: Updated dependency `msw` to `^1.0.0`.
- 2ea57821629: Fixed bug in LinguistBackendApi that caused initial batch of entities to be skipped.
- b271d5ca052: Allow kind to be configurable

  ```ts
  return createRouter({ schedule: schedule, kind: ['Component'] }, { ...env });
  ```

- Updated dependencies
  - @backstage/catalog-client@1.4.0
  - @backstage/plugin-auth-node@0.2.12
  - @backstage/backend-tasks@0.5.0
  - @backstage/backend-common@0.18.3
  - @backstage/errors@1.1.5
  - @backstage/catalog-model@1.2.1
  - @backstage/config@1.0.7
  - @backstage/types@1.0.2
  - @backstage-community/plugin-linguist-common@0.1.0

## 0.2.0-next.2

### Patch Changes

- 8a298b47240: Added support for linguist-js options using the linguistJSOptions in the plugin, the available config can be found [here](https://www.npmjs.com/package/linguist-js#API).
- Updated dependencies
  - @backstage/plugin-auth-node@0.2.12-next.2
  - @backstage/backend-tasks@0.5.0-next.2
  - @backstage/backend-common@0.18.3-next.2
  - @backstage/config@1.0.7-next.0

## 0.2.0-next.1

### Patch Changes

- 52b0022dab7: Updated dependency `msw` to `^1.0.0`.
- b271d5ca052: Allow kind to be configurable

  ```ts
  return createRouter({ schedule: schedule, kind: ['Component'] }, { ...env });
  ```

- Updated dependencies
  - @backstage/errors@1.1.5-next.0
  - @backstage/backend-common@0.18.3-next.1
  - @backstage/catalog-client@1.4.0-next.1
  - @backstage/plugin-auth-node@0.2.12-next.1
  - @backstage/backend-tasks@0.4.4-next.1
  - @backstage/config@1.0.7-next.0
  - @backstage/catalog-model@1.2.1-next.1
  - @backstage/types@1.0.2
  - @backstage-community/plugin-linguist-common@0.1.0

## 0.2.0-next.0

### Minor Changes

- 4a1c318853: **BREAKING** The linguist-backend `createRouter` now requires that the `tokenManger` is passed to the router.

### Patch Changes

- 2ea5782162: Fixed bug in LinguistBackendApi that caused initial batch of entities to be skipped.
- Updated dependencies
  - @backstage/catalog-client@1.4.0-next.0
  - @backstage/backend-tasks@0.4.4-next.0
  - @backstage/backend-common@0.18.3-next.0
  - @backstage/catalog-model@1.2.1-next.0
  - @backstage/config@1.0.6
  - @backstage/errors@1.1.4
  - @backstage/types@1.0.2
  - @backstage/plugin-auth-node@0.2.12-next.0
  - @backstage-community/plugin-linguist-common@0.1.0

## 0.1.0

### Minor Changes

- 75cfee5688: Introduced the Linguist plugin, checkout the plugin's `README.md` for more details!

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.2
  - @backstage/catalog-model@1.2.0
  - @backstage-community/plugin-linguist-common@0.1.0
  - @backstage/backend-tasks@0.4.3
  - @backstage/catalog-client@1.3.1
  - @backstage/config@1.0.6
  - @backstage/errors@1.1.4
  - @backstage/types@1.0.2
  - @backstage/plugin-auth-node@0.2.11
