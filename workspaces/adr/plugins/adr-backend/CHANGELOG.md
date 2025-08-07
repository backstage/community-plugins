# @backstage-community/plugin-adr-backend

## 0.12.0

### Minor Changes

- c5f6243: Backstage version bump to v1.41.1

### Patch Changes

- Updated dependencies [c5f6243]
  - @backstage-community/plugin-adr-common@0.10.0
  - @backstage-community/search-backend-module-adr@0.9.0

## 0.11.0

### Minor Changes

- e368185: Backstage version bump to v1.40.2

### Patch Changes

- Updated dependencies [e368185]
  - @backstage-community/plugin-adr-common@0.9.0
  - @backstage-community/search-backend-module-adr@0.8.0

## 0.10.0

### Minor Changes

- fc4fa2c: Backstage version bump to v1.39.0

### Patch Changes

- Updated dependencies [fc4fa2c]
  - @backstage-community/plugin-adr-common@0.8.0
  - @backstage-community/search-backend-module-adr@0.7.0

## 0.9.0

### Minor Changes

- e22d803: Backstage version bump to v1.38.1

### Patch Changes

- Updated dependencies [e22d803]
  - @backstage-community/plugin-adr-common@0.7.0
  - @backstage-community/search-backend-module-adr@0.6.0

## 0.8.0

### Minor Changes

- b397bd6: Added extension point to backend plugin so that a custom ADR parser can be provided in modules to support additional ADR formats.

### Patch Changes

- Updated dependencies [b397bd6]
  - @backstage-community/plugin-adr-common@0.6.0
  - @backstage-community/search-backend-module-adr@0.5.1

## 0.7.0

### Minor Changes

- b075789: Backstage version bump to v1.37.0

### Patch Changes

- Updated dependencies [b075789]
  - @backstage-community/plugin-adr-common@0.5.0
  - @backstage-community/search-backend-module-adr@0.5.0

## 0.6.0

### Minor Changes

- d527ea3: Backstage version bump to v1.35.1

### Patch Changes

- Updated dependencies [d527ea3]
  - @backstage-community/plugin-adr-common@0.4.0
  - @backstage-community/search-backend-module-adr@0.4.0

## 0.5.3

### Patch Changes

- eb6cbef: Fixed a bug that caused no ADRs to be returned from `/list` if at least one failed to parse.

## 0.5.2

### Patch Changes

- Updated dependencies [03913ac]
  - @backstage-community/search-backend-module-adr@0.3.2

## 0.5.1

### Patch Changes

- Updated dependencies [9e92818]
  - @backstage-community/search-backend-module-adr@0.3.1

## 0.5.0

### Minor Changes

- d5e54af: Backstage version bump to v1.34.1

### Patch Changes

- Updated dependencies [d5e54af]
  - @backstage-community/plugin-adr-common@0.3.0
  - @backstage-community/search-backend-module-adr@0.3.0

## 0.4.27

### Patch Changes

- e45e2f8: Remove unused @backstage/backend-common package from dependencies.

## 0.4.26

### Patch Changes

- b9f6780: Backstage version bump to v1.32.2
- Updated dependencies [b9f6780]
  - @backstage-community/plugin-adr-common@0.2.30
  - @backstage-community/search-backend-module-adr@0.2.1

## 0.4.25

### Patch Changes

- 5b56188: Backstage version bump to v1.31.1
- Updated dependencies [5b56188]
- Updated dependencies [5b56188]
  - @backstage-community/search-backend-module-adr@0.2.0
  - @backstage-community/plugin-adr-common@0.2.29

## 0.4.24

### Patch Changes

- Updated dependencies [f43e557]
  - @backstage-community/search-backend-module-adr@0.1.4

## 0.4.23

### Patch Changes

- f18c579: Backstage version bump to v1.30.2
- Updated dependencies [f18c579]
  - @backstage-community/plugin-adr-common@0.2.28
  - @backstage-community/search-backend-module-adr@0.1.3

## 0.4.22

### Patch Changes

- ae2ee8a: Updated dependency `@types/supertest` to `^6.0.0`.
  Updated dependency `supertest` to `^7.0.0`.

## 0.4.21

### Patch Changes

- 5541765: Add missing dependency on `@backstage-community/search-backend-module-adr`
- Updated dependencies [5541765]
  - @backstage-community/plugin-adr-common@0.2.27
  - @backstage-community/search-backend-module-adr@0.1.2

## 0.4.20

### Patch Changes

- 72e8c01: version:bump to v1.29.1
- Updated dependencies [72e8c01]
  - @backstage-community/plugin-adr-common@0.2.26

## 0.4.19

### Patch Changes

- 4d1426a: The `DefaultAdrCollatorFactory` and `AdrCollatorFactoryOptions` have been deprecated in favour of using the
  new `@backstage-community/search-backend-module-adr` module.

  The `search` types (`MadrParserOptions`, `createMadrParser`, `AdrParserContext`, `AdrParser`) have been moved
  to `@backstage-community/search-backend-module-adr`. If you were using any of these, please import them now
  from the dedicated search module package instead.

  All these types are now re-exported from the new locations, ensuring no diverged types.

- Updated dependencies [7ba08a5]
  - @backstage-community/plugin-adr-common@0.2.25

## 0.4.18

### Patch Changes

- 7ebbafb: Fixed bug where images from private repositories weren't accessible by the ADR plugin. Added `/image` API endpoint to adr-backend plugin which allows frontend to fetch images via backend with auth.

## 0.4.17

### Patch Changes

- 207b758: Update dependencies to Backstage version 1.27
- Updated dependencies [207b758]
  - @backstage-community/plugin-adr-common@0.2.24

## 0.4.16

### Patch Changes

- 6b9305e: Allow the `tokenManager` parameter to be optional when instantiating collator

## 0.4.15

### Patch Changes

- 193a2a3: Migrated from the [backstage/backstage](https://github.com/backstage/backstage) monorepo.
- Updated dependencies [193a2a3]
  - @backstage-community/plugin-adr-common@0.2.23

## 0.4.14

### Patch Changes

- d5a1fe1: Replaced winston logger with `LoggerService`
- Updated dependencies
  - @backstage/backend-common@0.21.7
  - @backstage/backend-plugin-api@0.6.17
  - @backstage/catalog-client@1.6.4
  - @backstage/integration@1.10.0
  - @backstage/catalog-model@1.4.5
  - @backstage/config@1.2.0
  - @backstage/errors@1.2.4
  - @backstage-community/plugin-adr-common@0.2.22
  - @backstage/plugin-search-common@1.2.11

## 0.4.14-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.21.7-next.1
  - @backstage/backend-plugin-api@0.6.17-next.1
  - @backstage/catalog-client@1.6.4-next.0
  - @backstage/catalog-model@1.4.5
  - @backstage/config@1.2.0
  - @backstage/errors@1.2.4
  - @backstage/integration@1.10.0-next.0
  - @backstage-community/plugin-adr-common@0.2.22-next.0
  - @backstage/plugin-search-common@1.2.11

## 0.4.14-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.21.7-next.0
  - @backstage/integration@1.10.0-next.0
  - @backstage/backend-plugin-api@0.6.17-next.0
  - @backstage/catalog-client@1.6.3
  - @backstage/catalog-model@1.4.5
  - @backstage/config@1.2.0
  - @backstage/errors@1.2.4
  - @backstage-community/plugin-adr-common@0.2.22-next.0
  - @backstage/plugin-search-common@1.2.11

## 0.4.13

### Patch Changes

- Updated dependencies
  - @backstage/catalog-client@1.6.3
  - @backstage/backend-common@0.21.6
  - @backstage/backend-plugin-api@0.6.16
  - @backstage/catalog-model@1.4.5
  - @backstage/config@1.2.0
  - @backstage/errors@1.2.4
  - @backstage/integration@1.9.1
  - @backstage-community/plugin-adr-common@0.2.21
  - @backstage/plugin-search-common@1.2.11

## 0.4.12

### Patch Changes

- Updated dependencies
  - @backstage/catalog-client@1.6.2
  - @backstage/backend-common@0.21.5
  - @backstage/backend-plugin-api@0.6.15
  - @backstage/catalog-model@1.4.5
  - @backstage/config@1.2.0
  - @backstage/errors@1.2.4
  - @backstage/integration@1.9.1
  - @backstage-community/plugin-adr-common@0.2.21
  - @backstage/plugin-search-common@1.2.11

## 0.4.11

### Patch Changes

- 334c5fe: Updated dependency `marked` to `^12.0.0`.
- c8fdd83: Migrated `DefaultAdrCollatorFactory` to support new auth services.
- Updated dependencies
  - @backstage/backend-common@0.21.4
  - @backstage/integration@1.9.1
  - @backstage/config@1.2.0
  - @backstage-community/plugin-adr-common@0.2.21
  - @backstage/errors@1.2.4
  - @backstage/backend-plugin-api@0.6.14
  - @backstage/plugin-search-common@1.2.11
  - @backstage/catalog-client@1.6.1
  - @backstage/catalog-model@1.4.5

## 0.4.11-next.2

### Patch Changes

- Updated dependencies
  - @backstage/integration@1.9.1-next.2
  - @backstage/catalog-client@1.6.1-next.1
  - @backstage/backend-common@0.21.4-next.2
  - @backstage-community/plugin-adr-common@0.2.21-next.2
  - @backstage/backend-plugin-api@0.6.14-next.2
  - @backstage/catalog-model@1.4.5-next.0
  - @backstage/config@1.2.0-next.1
  - @backstage/errors@1.2.4-next.0
  - @backstage/plugin-search-common@1.2.11-next.1

## 0.4.11-next.1

### Patch Changes

- Updated dependencies
  - @backstage/config@1.2.0-next.1
  - @backstage/backend-common@0.21.4-next.1
  - @backstage/backend-plugin-api@0.6.14-next.1
  - @backstage/integration@1.9.1-next.1
  - @backstage/catalog-client@1.6.1-next.0
  - @backstage/catalog-model@1.4.5-next.0
  - @backstage/errors@1.2.4-next.0
  - @backstage-community/plugin-adr-common@0.2.21-next.1
  - @backstage/plugin-search-common@1.2.11-next.1

## 0.4.10-next.0

### Patch Changes

- 334c5fe: Updated dependency `marked` to `^12.0.0`.
- c8fdd83: Migrated `DefaultAdrCollatorFactory` to support new auth services.
- Updated dependencies
  - @backstage/backend-common@0.21.3-next.0
  - @backstage-community/plugin-adr-common@0.2.21-next.0
  - @backstage/errors@1.2.4-next.0
  - @backstage/backend-plugin-api@0.6.13-next.0
  - @backstage/plugin-search-common@1.2.11-next.0
  - @backstage/catalog-client@1.6.1-next.0
  - @backstage/catalog-model@1.4.5-next.0
  - @backstage/config@1.1.2-next.0
  - @backstage/integration@1.9.1-next.0

## 0.4.7

### Patch Changes

- b64ce5a: Updated New Backend System instructions to use default import
- 9aac2b0: Use `--cwd` as the first `yarn` argument
- Updated dependencies
  - @backstage/backend-common@0.21.0
  - @backstage/backend-plugin-api@0.6.10
  - @backstage/catalog-model@1.4.4
  - @backstage/integration@1.9.0
  - @backstage/catalog-client@1.6.0
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3
  - @backstage-community/plugin-adr-common@0.2.20
  - @backstage/plugin-search-common@1.2.10

## 0.4.7-next.3

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.21.0-next.3
  - @backstage/integration@1.9.0-next.1
  - @backstage/backend-plugin-api@0.6.10-next.3
  - @backstage/catalog-client@1.6.0-next.1
  - @backstage/catalog-model@1.4.4-next.0
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3
  - @backstage-community/plugin-adr-common@0.2.20-next.1
  - @backstage/plugin-search-common@1.2.10

## 0.4.7-next.2

### Patch Changes

- 9aac2b0: Use `--cwd` as the first `yarn` argument
- Updated dependencies
  - @backstage/backend-common@0.21.0-next.2
  - @backstage/backend-plugin-api@0.6.10-next.2
  - @backstage/config@1.1.1
  - @backstage/catalog-client@1.6.0-next.1
  - @backstage/catalog-model@1.4.4-next.0
  - @backstage/errors@1.2.3
  - @backstage/integration@1.9.0-next.0
  - @backstage-community/plugin-adr-common@0.2.20-next.0
  - @backstage/plugin-search-common@1.2.10

## 0.4.7-next.1

### Patch Changes

- Updated dependencies
  - @backstage/catalog-model@1.4.4-next.0
  - @backstage/catalog-client@1.6.0-next.1
  - @backstage/backend-plugin-api@0.6.10-next.1
  - @backstage/backend-common@0.21.0-next.1
  - @backstage/integration@1.9.0-next.0
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3
  - @backstage-community/plugin-adr-common@0.2.20-next.0
  - @backstage/plugin-search-common@1.2.10

## 0.4.7-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.21.0-next.0
  - @backstage/catalog-client@1.6.0-next.0
  - @backstage/backend-plugin-api@0.6.10-next.0
  - @backstage/catalog-model@1.4.3
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3
  - @backstage/integration@1.8.0
  - @backstage-community/plugin-adr-common@0.2.19
  - @backstage/plugin-search-common@1.2.10

## 0.4.6

### Patch Changes

- 4016f21: Remove some unused dependencies
- Updated dependencies
  - @backstage/backend-common@0.20.1
  - @backstage/catalog-client@1.5.2
  - @backstage/backend-plugin-api@0.6.9
  - @backstage/catalog-model@1.4.3
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3
  - @backstage/integration@1.8.0
  - @backstage-community/plugin-adr-common@0.2.19
  - @backstage/plugin-search-common@1.2.10

## 0.4.6-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-plugin-api@0.6.9-next.2
  - @backstage/backend-common@0.20.1-next.2

## 0.4.6-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.20.1-next.1
  - @backstage/integration@1.8.0
  - @backstage/config@1.1.1
  - @backstage/backend-plugin-api@0.6.9-next.1
  - @backstage/catalog-client@1.5.2-next.0
  - @backstage/catalog-model@1.4.3
  - @backstage/errors@1.2.3
  - @backstage-community/plugin-adr-common@0.2.18
  - @backstage/plugin-search-common@1.2.9

## 0.4.6-next.0

### Patch Changes

- 4016f21: Remove some unused dependencies
- Updated dependencies
  - @backstage/backend-common@0.20.1-next.0
  - @backstage/catalog-client@1.5.2-next.0
  - @backstage/backend-plugin-api@0.6.9-next.0
  - @backstage/catalog-model@1.4.3
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3
  - @backstage/integration@1.8.0
  - @backstage-community/plugin-adr-common@0.2.18
  - @backstage/plugin-search-common@1.2.9

## 0.4.5

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.20.0
  - @backstage/catalog-client@1.5.0
  - @backstage/integration@1.8.0
  - @backstage/backend-plugin-api@0.6.8
  - @backstage/catalog-model@1.4.3
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3
  - @backstage-community/plugin-adr-common@0.2.18
  - @backstage/plugin-search-common@1.2.9

## 0.4.5-next.3

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.20.0-next.3
  - @backstage/backend-plugin-api@0.6.8-next.3
  - @backstage/catalog-client@1.5.0-next.1
  - @backstage/catalog-model@1.4.3
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3
  - @backstage/integration@1.8.0-next.1
  - @backstage-community/plugin-adr-common@0.2.18-next.1
  - @backstage/plugin-search-common@1.2.8

## 0.4.5-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.20.0-next.2
  - @backstage/catalog-client@1.5.0-next.1
  - @backstage/backend-plugin-api@0.6.8-next.2
  - @backstage/catalog-model@1.4.3
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3
  - @backstage/integration@1.8.0-next.1
  - @backstage-community/plugin-adr-common@0.2.18-next.1
  - @backstage/plugin-search-common@1.2.8

## 0.4.5-next.1

### Patch Changes

- Updated dependencies
  - @backstage/catalog-client@1.5.0-next.0
  - @backstage/integration@1.8.0-next.1
  - @backstage/backend-common@0.20.0-next.1
  - @backstage/backend-plugin-api@0.6.8-next.1
  - @backstage/catalog-model@1.4.3
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3
  - @backstage-community/plugin-adr-common@0.2.18-next.1
  - @backstage/plugin-search-common@1.2.8

## 0.4.5-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.20.0-next.0
  - @backstage/integration@1.8.0-next.0
  - @backstage/backend-plugin-api@0.6.8-next.0
  - @backstage/catalog-client@1.4.6
  - @backstage/catalog-model@1.4.3
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3
  - @backstage-community/plugin-adr-common@0.2.18-next.0
  - @backstage/plugin-search-common@1.2.8

## 0.4.4

### Patch Changes

- 68f8a55622: Updated dependency `@types/marked` to `^5.0.0`.
- Updated dependencies
  - @backstage/integration@1.7.2
  - @backstage/backend-common@0.19.9
  - @backstage/backend-plugin-api@0.6.7
  - @backstage/catalog-client@1.4.6
  - @backstage/catalog-model@1.4.3
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3
  - @backstage-community/plugin-adr-common@0.2.17
  - @backstage/plugin-search-common@1.2.8

## 0.4.4-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-plugin-api@0.6.7-next.2
  - @backstage/backend-common@0.19.9-next.2

## 0.4.4-next.1

### Patch Changes

- Updated dependencies
  - @backstage/integration@1.7.2-next.0
  - @backstage/backend-common@0.19.9-next.1
  - @backstage-community/plugin-adr-common@0.2.17-next.0
  - @backstage/backend-plugin-api@0.6.7-next.1
  - @backstage/catalog-client@1.4.5
  - @backstage/catalog-model@1.4.3
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3
  - @backstage/plugin-search-common@1.2.7

## 0.4.4-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.9-next.0
  - @backstage/integration@1.7.1
  - @backstage/backend-plugin-api@0.6.7-next.0
  - @backstage/catalog-client@1.4.5
  - @backstage/catalog-model@1.4.3
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3
  - @backstage-community/plugin-adr-common@0.2.16
  - @backstage/plugin-search-common@1.2.7

## 0.4.3

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.8
  - @backstage/integration@1.7.1
  - @backstage/catalog-model@1.4.3
  - @backstage/errors@1.2.3
  - @backstage/backend-plugin-api@0.6.6
  - @backstage-community/plugin-adr-common@0.2.16
  - @backstage/catalog-client@1.4.5
  - @backstage/config@1.1.1
  - @backstage/plugin-search-common@1.2.7

## 0.4.3-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.8-next.2
  - @backstage/catalog-model@1.4.3-next.0
  - @backstage/integration@1.7.1-next.1
  - @backstage/errors@1.2.3-next.0
  - @backstage/backend-plugin-api@0.6.6-next.2
  - @backstage/catalog-client@1.4.5-next.0
  - @backstage/config@1.1.1-next.0
  - @backstage-community/plugin-adr-common@0.2.16-next.1
  - @backstage/plugin-search-common@1.2.7-next.0

## 0.4.2-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.7-next.1
  - @backstage/backend-plugin-api@0.6.5-next.1
  - @backstage/config@1.1.0
  - @backstage/catalog-client@1.4.4
  - @backstage/catalog-model@1.4.2
  - @backstage/errors@1.2.2
  - @backstage/integration@1.7.1-next.0
  - @backstage-community/plugin-adr-common@0.2.16-next.0
  - @backstage/plugin-search-common@1.2.6

## 0.4.2-next.0

### Patch Changes

- Updated dependencies
  - @backstage/integration@1.7.1-next.0
  - @backstage/backend-common@0.19.7-next.0
  - @backstage-community/plugin-adr-common@0.2.16-next.0
  - @backstage/config@1.1.0
  - @backstage/backend-plugin-api@0.6.5-next.0
  - @backstage/catalog-client@1.4.4
  - @backstage/catalog-model@1.4.2
  - @backstage/errors@1.2.2
  - @backstage/plugin-search-common@1.2.6

## 0.4.0

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
  - @backstage/backend-common@0.19.5
  - @backstage/config@1.1.0
  - @backstage/catalog-client@1.4.4
  - @backstage/catalog-model@1.4.2
  - @backstage/errors@1.2.2
  - @backstage/integration@1.7.0
  - @backstage-community/plugin-adr-common@0.2.15
  - @backstage/plugin-search-common@1.2.6
  - @backstage/backend-plugin-api@0.6.3

## 0.4.0-next.3

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
  - @backstage/integration@1.7.0-next.3
  - @backstage-community/plugin-adr-common@0.2.15-next.3
  - @backstage/plugin-search-common@1.2.6-next.2
  - @backstage/backend-plugin-api@0.6.3-next.3
  - @backstage/backend-common@0.19.5-next.3

## 0.3.9-next.2

### Patch Changes

- Updated dependencies
  - @backstage/config@1.1.0-next.1
  - @backstage/backend-common@0.19.5-next.2
  - @backstage/integration@1.7.0-next.2
  - @backstage/backend-plugin-api@0.6.3-next.2
  - @backstage/catalog-model@1.4.2-next.1
  - @backstage/catalog-client@1.4.4-next.1
  - @backstage/errors@1.2.1
  - @backstage-community/plugin-adr-common@0.2.15-next.2
  - @backstage/plugin-search-common@1.2.6-next.1

## 0.3.9-next.1

### Patch Changes

- Updated dependencies
  - @backstage/config@1.1.0-next.0
  - @backstage/integration@1.7.0-next.1
  - @backstage/backend-common@0.19.5-next.1
  - @backstage/backend-plugin-api@0.6.3-next.1
  - @backstage/catalog-model@1.4.2-next.0
  - @backstage-community/plugin-adr-common@0.2.15-next.1
  - @backstage/catalog-client@1.4.4-next.0
  - @backstage/errors@1.2.1
  - @backstage/plugin-search-common@1.2.6-next.0

## 0.3.8-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.4-next.0
  - @backstage/integration@1.7.0-next.0
  - @backstage/backend-plugin-api@0.6.2-next.0
  - @backstage/catalog-client@1.4.3
  - @backstage/catalog-model@1.4.1
  - @backstage/config@1.0.8
  - @backstage/errors@1.2.1
  - @backstage-community/plugin-adr-common@0.2.14-next.0
  - @backstage/plugin-search-common@1.2.5

## 0.3.6

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.2
  - @backstage/backend-plugin-api@0.6.0
  - @backstage/integration@1.6.0
  - @backstage/catalog-client@1.4.3
  - @backstage/catalog-model@1.4.1
  - @backstage/config@1.0.8
  - @backstage/errors@1.2.1
  - @backstage-community/plugin-adr-common@0.2.12
  - @backstage/plugin-search-common@1.2.5

## 0.3.6-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-plugin-api@0.6.0-next.2
  - @backstage/backend-common@0.19.2-next.2

## 0.3.6-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.2-next.1
  - @backstage/backend-plugin-api@0.6.0-next.1
  - @backstage/integration@1.5.1
  - @backstage/catalog-client@1.4.3
  - @backstage/catalog-model@1.4.1
  - @backstage/config@1.0.8
  - @backstage/errors@1.2.1
  - @backstage-community/plugin-adr-common@0.2.11
  - @backstage/plugin-search-common@1.2.5

## 0.3.6-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.2-next.0
  - @backstage/backend-plugin-api@0.5.5-next.0
  - @backstage/catalog-client@1.4.3
  - @backstage/catalog-model@1.4.1
  - @backstage/config@1.0.8
  - @backstage/errors@1.2.1
  - @backstage/integration@1.5.1
  - @backstage-community/plugin-adr-common@0.2.11
  - @backstage/plugin-search-common@1.2.5

## 0.3.5

### Patch Changes

- a8805a9a4f25: Added support for the [new backend system](https://backstage.io/docs/backend-system/)
- Updated dependencies
  - @backstage/errors@1.2.1
  - @backstage/backend-common@0.19.1
  - @backstage-community/plugin-adr-common@0.2.11
  - @backstage/backend-plugin-api@0.5.4
  - @backstage/catalog-client@1.4.3
  - @backstage/catalog-model@1.4.1
  - @backstage/config@1.0.8
  - @backstage/integration@1.5.1
  - @backstage/plugin-search-common@1.2.5

## 0.3.5-next.1

### Patch Changes

- a8805a9a4f25: Added support for the [new backend system](https://backstage.io/docs/backend-system/)
- Updated dependencies
  - @backstage-community/plugin-adr-common@0.2.11-next.1
  - @backstage/backend-common@0.19.1-next.0
  - @backstage/backend-plugin-api@0.5.4-next.0
  - @backstage/catalog-client@1.4.3-next.0
  - @backstage/catalog-model@1.4.1-next.0
  - @backstage/config@1.0.8
  - @backstage/errors@1.2.1-next.0
  - @backstage/integration@1.5.1-next.0
  - @backstage/plugin-search-common@1.2.5-next.0

## 0.3.5-next.0

### Patch Changes

- Updated dependencies
  - @backstage/errors@1.2.1-next.0
  - @backstage/backend-common@0.19.1-next.0
  - @backstage/catalog-client@1.4.3-next.0
  - @backstage/catalog-model@1.4.1-next.0
  - @backstage/config@1.0.8
  - @backstage/integration@1.5.1-next.0
  - @backstage-community/plugin-adr-common@0.2.11-next.0
  - @backstage/plugin-search-common@1.2.5-next.0

## 0.3.4

### Patch Changes

- 58524588448c: Use front matter parser for MADR v3 formatted ADRs when indexing status/date
- Updated dependencies
  - @backstage/backend-common@0.19.0
  - @backstage/catalog-client@1.4.2
  - @backstage/integration@1.5.0
  - @backstage/catalog-model@1.4.0
  - @backstage/errors@1.2.0
  - @backstage-community/plugin-adr-common@0.2.10
  - @backstage/config@1.0.8
  - @backstage/plugin-search-common@1.2.4

## 0.3.4-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.0-next.2
  - @backstage/catalog-model@1.4.0-next.1
  - @backstage/catalog-client@1.4.2-next.2
  - @backstage/config@1.0.7
  - @backstage/errors@1.2.0-next.0
  - @backstage/integration@1.5.0-next.0
  - @backstage-community/plugin-adr-common@0.2.10-next.1
  - @backstage/plugin-search-common@1.2.4-next.0

## 0.3.4-next.1

### Patch Changes

- 58524588448c: Use front matter parser for MADR v3 formatted ADRs when indexing status/date
- Updated dependencies
  - @backstage/backend-common@0.19.0-next.1
  - @backstage/integration@1.5.0-next.0
  - @backstage/errors@1.2.0-next.0
  - @backstage/catalog-model@1.4.0-next.0
  - @backstage-community/plugin-adr-common@0.2.10-next.0
  - @backstage/catalog-client@1.4.2-next.1
  - @backstage/config@1.0.7
  - @backstage/plugin-search-common@1.2.4-next.0

## 0.3.4-next.0

### Patch Changes

- Updated dependencies
  - @backstage/catalog-client@1.4.2-next.0
  - @backstage/backend-common@0.18.6-next.0
  - @backstage/integration@1.4.5
  - @backstage/config@1.0.7
  - @backstage/catalog-model@1.3.0
  - @backstage/errors@1.1.5
  - @backstage-community/plugin-adr-common@0.2.9
  - @backstage/plugin-search-common@1.2.3

## 0.3.3

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.5
  - @backstage/integration@1.4.5
  - @backstage/catalog-client@1.4.1
  - @backstage/catalog-model@1.3.0
  - @backstage/config@1.0.7
  - @backstage/errors@1.1.5
  - @backstage-community/plugin-adr-common@0.2.9
  - @backstage/plugin-search-common@1.2.3

## 0.3.3-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.5-next.1
  - @backstage/config@1.0.7

## 0.3.3-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.5-next.0
  - @backstage/integration@1.4.5-next.0
  - @backstage-community/plugin-adr-common@0.2.9-next.0
  - @backstage/catalog-client@1.4.1
  - @backstage/catalog-model@1.3.0
  - @backstage/config@1.0.7
  - @backstage/errors@1.1.5
  - @backstage/plugin-search-common@1.2.3

## 0.3.2

### Patch Changes

- 7d75f6d9b8f: chore: Improve API Reference documentation
- Updated dependencies
  - @backstage/backend-common@0.18.4
  - @backstage/catalog-client@1.4.1
  - @backstage-community/plugin-adr-common@0.2.8
  - @backstage/catalog-model@1.3.0
  - @backstage/integration@1.4.4
  - @backstage/config@1.0.7
  - @backstage/errors@1.1.5
  - @backstage/plugin-search-common@1.2.3

## 0.3.2-next.3

### Patch Changes

- Updated dependencies
  - @backstage-community/plugin-adr-common@0.2.8-next.1
  - @backstage/catalog-model@1.3.0-next.0
  - @backstage/backend-common@0.18.4-next.2
  - @backstage/catalog-client@1.4.1-next.1
  - @backstage/config@1.0.7
  - @backstage/errors@1.1.5
  - @backstage/integration@1.4.4-next.0
  - @backstage/plugin-search-common@1.2.3-next.0

## 0.3.2-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.4-next.2
  - @backstage/catalog-client@1.4.1-next.0
  - @backstage/catalog-model@1.2.1
  - @backstage/config@1.0.7
  - @backstage/errors@1.1.5
  - @backstage/integration@1.4.4-next.0
  - @backstage-community/plugin-adr-common@0.2.8-next.0
  - @backstage/plugin-search-common@1.2.3-next.0

## 0.3.2-next.1

### Patch Changes

- 7d75f6d9b8f: chore: Improve API Reference documentation
- Updated dependencies
  - @backstage/integration@1.4.4-next.0
  - @backstage/backend-common@0.18.4-next.1
  - @backstage/catalog-client@1.4.0
  - @backstage/catalog-model@1.2.1
  - @backstage/config@1.0.7
  - @backstage/errors@1.1.5
  - @backstage-community/plugin-adr-common@0.2.8-next.0
  - @backstage/plugin-search-common@1.2.3-next.0

## 0.3.2-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.4-next.0
  - @backstage/config@1.0.7
  - @backstage/integration@1.4.3
  - @backstage/catalog-client@1.4.0
  - @backstage/catalog-model@1.2.1
  - @backstage/errors@1.1.5
  - @backstage-community/plugin-adr-common@0.2.7
  - @backstage/plugin-search-common@1.2.2

## 0.3.1

### Patch Changes

- 2a73ded3861: Support MADR v3 format
- 8bf24946c66: Adjust express dependencies to be the same as the rest of the project
- 52b0022dab7: Updated dependency `msw` to `^1.0.0`.
- Updated dependencies
  - @backstage/catalog-client@1.4.0
  - @backstage/backend-common@0.18.3
  - @backstage/errors@1.1.5
  - @backstage/catalog-model@1.2.1
  - @backstage/integration@1.4.3
  - @backstage/config@1.0.7
  - @backstage-community/plugin-adr-common@0.2.7
  - @backstage/plugin-search-common@1.2.2

## 0.3.1-next.2

### Patch Changes

- 2a73ded3861: Support MADR v3 format
- Updated dependencies
  - @backstage/backend-common@0.18.3-next.2
  - @backstage/config@1.0.7-next.0
  - @backstage/integration@1.4.3-next.0

## 0.3.1-next.1

### Patch Changes

- 52b0022dab7: Updated dependency `msw` to `^1.0.0`.
- Updated dependencies
  - @backstage/errors@1.1.5-next.0
  - @backstage/backend-common@0.18.3-next.1
  - @backstage/catalog-client@1.4.0-next.1
  - @backstage/integration@1.4.3-next.0
  - @backstage/config@1.0.7-next.0
  - @backstage/catalog-model@1.2.1-next.1
  - @backstage-community/plugin-adr-common@0.2.7-next.1
  - @backstage/plugin-search-common@1.2.2-next.0

## 0.3.1-next.0

### Patch Changes

- 8bf24946c6: Adjust express dependencies to be the same as the rest of the project
- Updated dependencies
  - @backstage/catalog-client@1.4.0-next.0
  - @backstage/backend-common@0.18.3-next.0
  - @backstage/catalog-model@1.2.1-next.0
  - @backstage/config@1.0.6
  - @backstage/errors@1.1.4
  - @backstage/integration@1.4.2
  - @backstage-community/plugin-adr-common@0.2.7-next.0
  - @backstage/plugin-search-common@1.2.1

## 0.3.0

### Minor Changes

- 0a32911d8a: Display title, status and date in ADR navigation, sourced from ADR content and reverse order.

### Patch Changes

- c51efce2a0: Update docs to always use `yarn add --cwd` for app & backend
- Updated dependencies
  - @backstage/backend-common@0.18.2
  - @backstage/catalog-model@1.2.0
  - @backstage/catalog-client@1.3.1
  - @backstage/config@1.0.6
  - @backstage/errors@1.1.4
  - @backstage/integration@1.4.2
  - @backstage-community/plugin-adr-common@0.2.6
  - @backstage/plugin-search-common@1.2.1

## 0.2.7-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.2-next.2
  - @backstage/catalog-model@1.2.0-next.1
  - @backstage/catalog-client@1.3.1-next.1
  - @backstage/config@1.0.6
  - @backstage/errors@1.1.4
  - @backstage/integration@1.4.2
  - @backstage-community/plugin-adr-common@0.2.6-next.1
  - @backstage/plugin-search-common@1.2.1

## 0.2.7-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.2-next.1
  - @backstage/catalog-client@1.3.1-next.0
  - @backstage/catalog-model@1.1.6-next.0
  - @backstage/config@1.0.6
  - @backstage/errors@1.1.4
  - @backstage/integration@1.4.2
  - @backstage-community/plugin-adr-common@0.2.6-next.0
  - @backstage/plugin-search-common@1.2.1

## 0.2.7-next.0

### Patch Changes

- Updated dependencies
  - @backstage/catalog-model@1.1.6-next.0
  - @backstage/backend-common@0.18.2-next.0
  - @backstage/catalog-client@1.3.1-next.0
  - @backstage-community/plugin-adr-common@0.2.6-next.0

## 0.2.5

### Patch Changes

- aa17643a06: This plugin now exports a `createRouter` method which uses `UrlReaders` to make requests to your SCM. Please make sure you read the [install instructions](https://github.com/backstage/backstage/blob/master/plugins/adr-backend/README.md#install)
- 21ffbdd5ee: Clarify that default ADR parsers support MADR specification v2.x
- Updated dependencies
  - @backstage/backend-common@0.18.0
  - @backstage/catalog-model@1.1.5
  - @backstage/catalog-client@1.3.0
  - @backstage/config@1.0.6
  - @backstage/errors@1.1.4
  - @backstage/integration@1.4.2
  - @backstage-community/plugin-adr-common@0.2.5
  - @backstage/plugin-search-common@1.2.1

## 0.2.5-next.2

### Patch Changes

- e4469d0ec1: The ADR plugin can now work with sites other than GitHub. Expanded the ADR backend plugin to provide endpoints to facilitate this.

  **BREAKING** The ADR plugin now uses UrlReaders. You will have to [configure integrations](https://backstage.io/docs/integrations/index#configuration) for all sites you want to get ADRs from. If you would like to create your own implementation that has different behavior, you can override the AdrApi [just like you can with other apis.](https://backstage.io/docs/api/utility-apis#app-apis) The previously used Octokit implementation has been completely removed.

- 21ffbdd5ee: Clarify that default ADR parsers support MADR specification v2.x
- Updated dependencies
  - @backstage/backend-common@0.18.0-next.1
  - @backstage/catalog-client@1.3.0-next.2
  - @backstage/catalog-model@1.1.5-next.1
  - @backstage/config@1.0.6-next.0
  - @backstage/errors@1.1.4
  - @backstage/integration@1.4.2-next.0
  - @backstage-community/plugin-adr-common@0.2.5-next.1
  - @backstage/plugin-search-common@1.2.1-next.0

## 0.2.5-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.0-next.0
  - @backstage/config@1.0.6-next.0
  - @backstage/catalog-client@1.3.0-next.1
  - @backstage/catalog-model@1.1.5-next.1
  - @backstage/errors@1.1.4
  - @backstage/integration@1.4.2-next.0
  - @backstage-community/plugin-adr-common@0.2.5-next.1
  - @backstage/plugin-search-common@1.2.1-next.0

## 0.2.5-next.0

### Patch Changes

- Updated dependencies
  - @backstage/catalog-model@1.1.5-next.0
  - @backstage/catalog-client@1.3.0-next.0
  - @backstage/backend-common@0.17.0
  - @backstage/config@1.0.5
  - @backstage/errors@1.1.4
  - @backstage/integration@1.4.1
  - @backstage-community/plugin-adr-common@0.2.5-next.0
  - @backstage/plugin-search-common@1.2.0

## 0.2.4

### Patch Changes

- 3280711113: Updated dependency `msw` to `^0.49.0`.
- Updated dependencies
  - @backstage/catalog-client@1.2.0
  - @backstage/backend-common@0.17.0
  - @backstage/errors@1.1.4
  - @backstage/integration@1.4.1
  - @backstage/plugin-search-common@1.2.0
  - @backstage/catalog-model@1.1.4
  - @backstage/config@1.0.5
  - @backstage-community/plugin-adr-common@0.2.4

## 0.2.4-next.3

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.17.0-next.3
  - @backstage/catalog-client@1.2.0-next.1
  - @backstage/catalog-model@1.1.4-next.1
  - @backstage/config@1.0.5-next.1
  - @backstage/errors@1.1.4-next.1
  - @backstage/integration@1.4.1-next.1
  - @backstage-community/plugin-adr-common@0.2.4-next.3
  - @backstage/plugin-search-common@1.2.0-next.3

## 0.2.4-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.17.0-next.2
  - @backstage/plugin-search-common@1.2.0-next.2
  - @backstage/catalog-client@1.2.0-next.1
  - @backstage/catalog-model@1.1.4-next.1
  - @backstage/config@1.0.5-next.1
  - @backstage/errors@1.1.4-next.1
  - @backstage/integration@1.4.1-next.1
  - @backstage-community/plugin-adr-common@0.2.4-next.2

## 0.2.4-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.17.0-next.1
  - @backstage/config@1.0.5-next.1
  - @backstage/integration@1.4.1-next.1
  - @backstage/catalog-client@1.2.0-next.1
  - @backstage/catalog-model@1.1.4-next.1
  - @backstage/errors@1.1.4-next.1
  - @backstage-community/plugin-adr-common@0.2.4-next.1
  - @backstage/plugin-search-common@1.1.2-next.1

## 0.2.4-next.0

### Patch Changes

- 3280711113: Updated dependency `msw` to `^0.49.0`.
- Updated dependencies
  - @backstage/catalog-client@1.2.0-next.0
  - @backstage/backend-common@0.16.1-next.0
  - @backstage/integration@1.4.1-next.0
  - @backstage/catalog-model@1.1.4-next.0
  - @backstage/config@1.0.5-next.0
  - @backstage/errors@1.1.4-next.0
  - @backstage-community/plugin-adr-common@0.2.4-next.0
  - @backstage/plugin-search-common@1.1.2-next.0

## 0.2.3

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.16.0
  - @backstage/integration@1.4.0
  - @backstage/catalog-model@1.1.3
  - @backstage/catalog-client@1.1.2
  - @backstage/config@1.0.4
  - @backstage/errors@1.1.3
  - @backstage-community/plugin-adr-common@0.2.3
  - @backstage/plugin-search-common@1.1.1

## 0.2.3-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.16.0-next.1
  - @backstage/catalog-client@1.1.2-next.0
  - @backstage/catalog-model@1.1.3-next.0
  - @backstage/config@1.0.4-next.0
  - @backstage/errors@1.1.3-next.0
  - @backstage/integration@1.4.0-next.0
  - @backstage-community/plugin-adr-common@0.2.3-next.0
  - @backstage/plugin-search-common@1.1.1-next.0

## 0.2.3-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.16.0-next.0
  - @backstage/integration@1.4.0-next.0
  - @backstage/catalog-model@1.1.3-next.0
  - @backstage-community/plugin-adr-common@0.2.3-next.0
  - @backstage/catalog-client@1.1.2-next.0
  - @backstage/config@1.0.4-next.0
  - @backstage/errors@1.1.3-next.0
  - @backstage/plugin-search-common@1.1.1-next.0

## 0.2.2

### Patch Changes

- 8006f8a602: In order to improve the debuggability of the search indexing process, messages logged during indexing are now tagged with a `documentType` whose value corresponds to the `type` being indexed.
- Updated dependencies
  - @backstage/catalog-model@1.1.2
  - @backstage/backend-common@0.15.2
  - @backstage/catalog-client@1.1.1
  - @backstage/plugin-search-common@1.1.0
  - @backstage-community/plugin-adr-common@0.2.2
  - @backstage/config@1.0.3
  - @backstage/errors@1.1.2
  - @backstage/integration@1.3.2

## 0.2.2-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.15.2-next.2
  - @backstage/plugin-search-common@1.1.0-next.2
  - @backstage/catalog-client@1.1.1-next.2
  - @backstage/catalog-model@1.1.2-next.2
  - @backstage/config@1.0.3-next.2
  - @backstage/errors@1.1.2-next.2
  - @backstage/integration@1.3.2-next.2
  - @backstage-community/plugin-adr-common@0.2.2-next.2

## 0.2.2-next.1

### Patch Changes

- Updated dependencies
  - @backstage/catalog-client@1.1.1-next.1
  - @backstage/backend-common@0.15.2-next.1
  - @backstage/plugin-search-common@1.1.0-next.1
  - @backstage/catalog-model@1.1.2-next.1
  - @backstage/config@1.0.3-next.1
  - @backstage/errors@1.1.2-next.1
  - @backstage/integration@1.3.2-next.1
  - @backstage-community/plugin-adr-common@0.2.2-next.1

## 0.2.2-next.0

### Patch Changes

- Updated dependencies
  - @backstage/catalog-model@1.1.2-next.0
  - @backstage/catalog-client@1.1.1-next.0
  - @backstage-community/plugin-adr-common@0.2.2-next.0
  - @backstage/backend-common@0.15.2-next.0
  - @backstage/config@1.0.3-next.0
  - @backstage/errors@1.1.2-next.0
  - @backstage/integration@1.3.2-next.0
  - @backstage/plugin-search-common@1.0.2-next.0

## 0.2.1

### Patch Changes

- b489de83b1: Continue processing subsequent entities when an error occurs in collator
- 667d917488: Updated dependency `msw` to `^0.47.0`.
- 87ec2ba4d6: Updated dependency `msw` to `^0.46.0`.
- bf5e9030eb: Updated dependency `msw` to `^0.45.0`.
- Updated dependencies
  - @backstage/backend-common@0.15.1
  - @backstage/integration@1.3.1
  - @backstage/catalog-client@1.1.0
  - @backstage/catalog-model@1.1.1
  - @backstage/config@1.0.2
  - @backstage/errors@1.1.1
  - @backstage-community/plugin-adr-common@0.2.1
  - @backstage/plugin-search-common@1.0.1

## 0.2.1-next.3

### Patch Changes

- Updated dependencies
  - @backstage/catalog-client@1.1.0-next.2
  - @backstage/catalog-model@1.1.1-next.0
  - @backstage/config@1.0.2-next.0
  - @backstage/errors@1.1.1-next.0
  - @backstage/integration@1.3.1-next.2
  - @backstage/backend-common@0.15.1-next.3
  - @backstage-community/plugin-adr-common@0.2.1-next.1

## 0.2.1-next.2

### Patch Changes

- 667d917488: Updated dependency `msw` to `^0.47.0`.
- 87ec2ba4d6: Updated dependency `msw` to `^0.46.0`.
- Updated dependencies
  - @backstage/backend-common@0.15.1-next.2
  - @backstage/integration@1.3.1-next.1
  - @backstage/catalog-client@1.0.5-next.1

## 0.2.1-next.1

### Patch Changes

- b489de83b1: Continue processing subsequent entities when an error occurs in collator
- Updated dependencies
  - @backstage/backend-common@0.15.1-next.1

## 0.2.1-next.0

### Patch Changes

- bf5e9030eb: Updated dependency `msw` to `^0.45.0`.
- Updated dependencies
  - @backstage/backend-common@0.15.1-next.0
  - @backstage/catalog-client@1.0.5-next.0
  - @backstage/integration@1.3.1-next.0
  - @backstage-community/plugin-adr-common@0.2.1-next.0
  - @backstage/plugin-search-common@1.0.1-next.0

## 0.2.0

### Minor Changes

- bfc7c50a09: Display associated entity as a chip in `AdrSearchResultListItem`

  BREAKING: `AdrDocument` now includes a `entityRef` property, if you have a custom `AdrParser` you will have to supply this property in your returned documents

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.15.0
  - @backstage-community/plugin-adr-common@0.2.0
  - @backstage/integration@1.3.0

## 0.2.0-next.1

### Minor Changes

- bfc7c50a09: Display associated entity as a chip in `AdrSearchResultListItem`

  BREAKING: `AdrDocument` now includes a `entityRef` property, if you have a custom `AdrParser` you will have to supply this property in your returned documents

### Patch Changes

- Updated dependencies
  - @backstage-community/plugin-adr-common@0.2.0-next.1
  - @backstage/backend-common@0.15.0-next.2

## 0.1.3-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.15.0-next.0
  - @backstage/integration@1.3.0-next.0
  - @backstage-community/plugin-adr-common@0.1.3-next.0

## 0.1.2

### Patch Changes

- a70869e775: Updated dependency `msw` to `^0.43.0`.
- 4e9a90e307: Updated dependency `luxon` to `^3.0.0`.
- 8006d0f9bf: Updated dependency `msw` to `^0.44.0`.
- Updated dependencies
  - @backstage/backend-common@0.14.1
  - @backstage/catalog-model@1.1.0
  - @backstage/plugin-search-common@1.0.0
  - @backstage/integration@1.2.2
  - @backstage/catalog-client@1.0.4
  - @backstage/errors@1.1.0
  - @backstage-community/plugin-adr-common@0.1.2

## 0.1.2-next.2

### Patch Changes

- a70869e775: Updated dependency `msw` to `^0.43.0`.
- 4e9a90e307: Updated dependency `luxon` to `^3.0.0`.
- Updated dependencies
  - @backstage/backend-common@0.14.1-next.3
  - @backstage/catalog-client@1.0.4-next.2
  - @backstage/integration@1.2.2-next.3
  - @backstage/catalog-model@1.1.0-next.3

## 0.1.2-next.1

### Patch Changes

- Updated dependencies
  - @backstage/catalog-model@1.1.0-next.1
  - @backstage/backend-common@0.14.1-next.1
  - @backstage/errors@1.1.0-next.0
  - @backstage/catalog-client@1.0.4-next.1
  - @backstage/integration@1.2.2-next.1
  - @backstage-community/plugin-adr-common@0.1.2-next.1
  - @backstage/plugin-search-common@0.3.6-next.0

## 0.1.2-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.14.1-next.0
  - @backstage/catalog-model@1.1.0-next.0
  - @backstage/integration@1.2.2-next.0
  - @backstage/catalog-client@1.0.4-next.0
  - @backstage-community/plugin-adr-common@0.1.2-next.0

## 0.1.1

### Patch Changes

- 8f7b1835df: Updated dependency `msw` to `^0.41.0`.
- Updated dependencies
  - @backstage/plugin-search-common@0.3.5
  - @backstage/backend-common@0.14.0
  - @backstage/integration@1.2.1
  - @backstage/catalog-client@1.0.3
  - @backstage/catalog-model@1.0.3
  - @backstage-community/plugin-adr-common@0.1.1

## 0.1.1-next.2

### Patch Changes

- Updated dependencies
  - @backstage/plugin-search-common@0.3.5-next.1
  - @backstage/backend-common@0.14.0-next.2
  - @backstage/integration@1.2.1-next.2

## 0.1.1-next.1

### Patch Changes

- 8f7b1835df: Updated dependency `msw` to `^0.41.0`.
- Updated dependencies
  - @backstage/backend-common@0.13.6-next.1
  - @backstage/catalog-client@1.0.3-next.0
  - @backstage/integration@1.2.1-next.1
  - @backstage/catalog-model@1.0.3-next.0
  - @backstage/plugin-search-common@0.3.5-next.0
  - @backstage-community/plugin-adr-common@0.1.1-next.1

## 0.1.1-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.13.6-next.0
  - @backstage/integration@1.2.1-next.0
  - @backstage-community/plugin-adr-common@0.1.1-next.0

## 0.1.0

### Minor Changes

- e73075a301: Implement ADR plugin

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.13.3
  - @backstage-community/plugin-adr-common@0.1.0
  - @backstage/integration@1.2.0
  - @backstage/config@1.0.1
  - @backstage/plugin-search-common@0.3.4
  - @backstage/catalog-client@1.0.2
  - @backstage/catalog-model@1.0.2

## 0.1.0-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.13.3-next.2
  - @backstage/config@1.0.1-next.0
  - @backstage/plugin-search-common@0.3.4-next.0
  - @backstage/catalog-model@1.0.2-next.0
  - @backstage/integration@1.2.0-next.1
  - @backstage-community/plugin-adr-common@0.1.0-next.1
  - @backstage/catalog-client@1.0.2-next.0

## 0.1.0-next.0

### Minor Changes

- e73075a301: Implement ADR plugin

### Patch Changes

- Updated dependencies
  - @backstage-community/plugin-adr-common@0.1.0-next.0
  - @backstage/backend-common@0.13.3-next.1
