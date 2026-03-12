# @backstage-community/plugin-vault-backend

## 0.20.0

### Minor Changes

- 92587e2: Backstage version bump to v1.48.2

### Patch Changes

- Updated dependencies [92587e2]
  - @backstage-community/plugin-vault-node@0.17.0

## 0.19.0

### Minor Changes

- 7ad5206: Added support for multiple secrets paths

### Patch Changes

- Updated dependencies [7ad5206]
  - @backstage-community/plugin-vault-node@0.16.0

## 0.18.0

### Minor Changes

- 84e3915: Backstage version bump to v1.47.2

### Patch Changes

- Updated dependencies [84e3915]
  - @backstage-community/plugin-vault-node@0.15.0

## 0.17.0

### Minor Changes

- 3fadf6b: Backstage version bump to v1.46.1

### Patch Changes

- Updated dependencies [3fadf6b]
  - @backstage-community/plugin-vault-node@0.14.0

## 0.16.0

### Minor Changes

- 3be39dd: Backstage version bump to v1.45.1

### Patch Changes

- Updated dependencies [3be39dd]
  - @backstage-community/plugin-vault-node@0.13.0

## 0.15.0

### Minor Changes

- 93c53da: Backstage version bump to v1.44.0

### Patch Changes

- Updated dependencies [93c53da]
  - @backstage-community/plugin-vault-node@0.12.0

## 0.14.0

### Minor Changes

- 24e80a4: Backstage version bump to v1.43.2

### Patch Changes

- Updated dependencies [24e80a4]
  - @backstage-community/plugin-vault-node@0.11.0

## 0.13.0

### Minor Changes

- 97a7669: Backstage version bump to v1.42.3

### Patch Changes

- Updated dependencies [97a7669]
  - @backstage-community/plugin-vault-node@0.10.0

## 0.12.0

### Minor Changes

- 97794d9: Backstage version bump to v1.41.1

### Patch Changes

- Updated dependencies [97794d9]
  - @backstage-community/plugin-vault-node@0.9.0

## 0.11.0

### Minor Changes

- f1eec5a: Backstage version bump to v1.40.2

### Patch Changes

- Updated dependencies [f1eec5a]
  - @backstage-community/plugin-vault-node@0.8.0

## 0.10.0

### Minor Changes

- 07ed09f: Backstage version bump to v1.39.0

### Patch Changes

- Updated dependencies [07ed09f]
  - @backstage-community/plugin-vault-node@0.7.0

## 0.9.0

### Minor Changes

- 6fed93a: Backstage version bump to v1.38.1

### Patch Changes

- Updated dependencies [6fed93a]
  - @backstage-community/plugin-vault-node@0.6.0

## 0.8.1

### Patch Changes

- bdf4d36: Add catalog plugins in devDependencies for development purposes.

## 0.8.0

### Minor Changes

- 416179b: Backstage version bump to v1.37.0

### Patch Changes

- Updated dependencies [416179b]
  - @backstage-community/plugin-vault-node@0.5.0

## 0.7.0

### Minor Changes

- 2c14d3a: Backstage version bump to v1.36.1

### Patch Changes

- Updated dependencies [2c14d3a]
  - @backstage-community/plugin-vault-node@0.4.0

## 0.6.0

### Minor Changes

- 9c6bac1: Backstage version bump to v1.35.1

### Patch Changes

- Updated dependencies [9c6bac1]
  - @backstage-community/plugin-vault-node@0.3.0

## 0.5.2

### Patch Changes

- e7dea45: Fixed typo under the "New Backend System" instructions

## 0.5.1

### Patch Changes

- e0cedc6: Removed dependency `@backstage/backend-tasks`

## 0.5.0

### Minor Changes

- 5bbd06d: Backstage version bump to v1.34.1

### Patch Changes

- Updated dependencies [5bbd06d]
  - @backstage-community/plugin-vault-node@0.2.0

## 0.4.21

### Patch Changes

- e45e2f8: Remove unused @backstage/backend-common package from dependencies.

## 0.4.20

### Patch Changes

- a9e36e9: Backstage version bump to v1.32.2
- Updated dependencies [a9e36e9]
  - @backstage-community/plugin-vault-node@0.1.17

## 0.4.19

### Patch Changes

- 26306c4: Backstage version bump to v1.31.2
- Updated dependencies [26306c4]
  - @backstage-community/plugin-vault-node@0.1.16

## 0.4.18

### Patch Changes

- 86821e2: Backstage version bump to v1.30.2
- Updated dependencies [86821e2]
  - @backstage-community/plugin-vault-node@0.1.15

## 0.4.17

### Patch Changes

- ae2ee8a: Updated dependency `@types/supertest` to `^6.0.0`.
  Updated dependency `supertest` to `^7.0.0`.

## 0.4.16

### Patch Changes

- 5541765: Add missing dependency on `@backstage/backend-defaults`

## 0.4.15

### Patch Changes

- 4f3003b: version:bump to v1.29.1
- Updated dependencies [4f3003b]
  - @backstage-community/plugin-vault-node@0.1.14

## 0.4.14

### Patch Changes

- 6f59d18: Fix package metadata
- Updated dependencies [6f59d18]
  - @backstage-community/plugin-vault-node@0.1.13

## 0.4.13

### Patch Changes

- 6757373: Backstage v1.28.4 version bump. Also addressed some of the upstream deprecations
- Updated dependencies [6757373]
  - @backstage-community/plugin-vault-node@0.1.12

## 0.4.12

### Patch Changes

- d606bde: Updated dependency `helmet` to `^7.0.0`.
- 94c6456: Added support to Kubernetes authentication for Vault.

  The Vault backend supports now 2 types of authentication:

  - `static`: The one available in the past. To keep using it, update the config to something like this:

    ```diff
    vault:
    -  token: <TOKEN>
    +  auth:
    +    type: static
    +    token: <TOKEN>
    ```

  - `kubernetes`: New option to login using Kubernetes roles. Check the [README.md](../plugins/vault-backend/README.md) for more details

  The old setup is still supported but will be removed in a future release. Make sure to update the format in the configuration file.

## 0.4.11

### Patch Changes

- 193a2a3: Migrated from the [backstage/backstage](https://github.com/backstage/backstage) monorepo.
- Updated dependencies [193a2a3]
  - @backstage-community/plugin-vault-node@0.1.11

## 0.4.10

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.21.7
  - @backstage/backend-plugin-api@0.6.17
  - @backstage/backend-tasks@0.5.22
  - @backstage/config@1.2.0
  - @backstage/errors@1.2.4
  - @backstage-community/plugin-vault-node@0.1.10

## 0.4.10-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.21.7-next.1
  - @backstage/backend-plugin-api@0.6.17-next.1
  - @backstage/backend-tasks@0.5.22-next.1
  - @backstage/config@1.2.0
  - @backstage/errors@1.2.4
  - @backstage-community/plugin-vault-node@0.1.10-next.1

## 0.4.10-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.21.7-next.0
  - @backstage/backend-plugin-api@0.6.17-next.0
  - @backstage/backend-tasks@0.5.22-next.0
  - @backstage/config@1.2.0
  - @backstage/errors@1.2.4
  - @backstage-community/plugin-vault-node@0.1.10-next.0

## 0.4.9

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.21.6
  - @backstage/backend-plugin-api@0.6.16
  - @backstage/backend-tasks@0.5.21
  - @backstage/config@1.2.0
  - @backstage/errors@1.2.4
  - @backstage-community/plugin-vault-node@0.1.9

## 0.4.8

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.21.5
  - @backstage/backend-tasks@0.5.20
  - @backstage/backend-plugin-api@0.6.15
  - @backstage/config@1.2.0
  - @backstage/errors@1.2.4
  - @backstage-community/plugin-vault-node@0.1.8

## 0.4.7

### Patch Changes

- 7277fe2: Removed lock inside recursion to avoid deadlocks
- 4467036: Allow unauthenticated access to health check endpoint.
- Updated dependencies
  - @backstage/backend-common@0.21.4
  - @backstage/config@1.2.0
  - @backstage/errors@1.2.4
  - @backstage/backend-plugin-api@0.6.14
  - @backstage/backend-tasks@0.5.19
  - @backstage-community/plugin-vault-node@0.1.7

## 0.4.7-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.21.4-next.2
  - @backstage/backend-plugin-api@0.6.14-next.2
  - @backstage/backend-tasks@0.5.19-next.2
  - @backstage/config@1.2.0-next.1
  - @backstage/errors@1.2.4-next.0
  - @backstage-community/plugin-vault-node@0.1.7-next.2

## 0.4.7-next.1

### Patch Changes

- Updated dependencies
  - @backstage/config@1.2.0-next.1
  - @backstage/backend-common@0.21.4-next.1
  - @backstage/backend-plugin-api@0.6.14-next.1
  - @backstage/backend-tasks@0.5.19-next.1
  - @backstage/errors@1.2.4-next.0
  - @backstage-community/plugin-vault-node@0.1.7-next.1

## 0.4.6-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.21.3-next.0
  - @backstage/errors@1.2.4-next.0
  - @backstage/backend-plugin-api@0.6.13-next.0
  - @backstage/backend-tasks@0.5.18-next.0
  - @backstage/config@1.1.2-next.0
  - @backstage-community/plugin-vault-node@0.1.6-next.0

## 0.4.3

### Patch Changes

- 9aac2b0: Use `--cwd` as the first `yarn` argument
- 8472188: Added or fixed the `repository` field in `package.json`.
- Updated dependencies
  - @backstage/backend-common@0.21.0
  - @backstage/backend-plugin-api@0.6.10
  - @backstage/backend-tasks@0.5.15
  - @backstage-community/plugin-vault-node@0.1.3
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3

## 0.4.3-next.3

### Patch Changes

- 8472188: Added or fixed the `repository` field in `package.json`.
- Updated dependencies
  - @backstage/backend-common@0.21.0-next.3
  - @backstage/backend-tasks@0.5.15-next.3
  - @backstage-community/plugin-vault-node@0.1.3-next.3
  - @backstage/backend-plugin-api@0.6.10-next.3
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3

## 0.4.3-next.2

### Patch Changes

- 9aac2b0: Use `--cwd` as the first `yarn` argument
- Updated dependencies
  - @backstage/backend-common@0.21.0-next.2
  - @backstage/backend-plugin-api@0.6.10-next.2
  - @backstage/backend-tasks@0.5.15-next.2
  - @backstage-community/plugin-vault-node@0.1.3-next.2
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3

## 0.4.3-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-plugin-api@0.6.10-next.1
  - @backstage/backend-common@0.21.0-next.1
  - @backstage/backend-tasks@0.5.15-next.1
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3
  - @backstage-community/plugin-vault-node@0.1.3-next.1

## 0.4.3-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.21.0-next.0
  - @backstage/backend-tasks@0.5.15-next.0
  - @backstage/backend-plugin-api@0.6.10-next.0
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3
  - @backstage-community/plugin-vault-node@0.1.3-next.0

## 0.4.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.20.1
  - @backstage/backend-plugin-api@0.6.9
  - @backstage/backend-tasks@0.5.14
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3
  - @backstage-community/plugin-vault-node@0.1.2

## 0.4.2-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-plugin-api@0.6.9-next.2
  - @backstage/backend-common@0.20.1-next.2
  - @backstage-community/plugin-vault-node@0.1.2-next.2
  - @backstage/backend-tasks@0.5.14-next.2

## 0.4.2-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.20.1-next.1
  - @backstage/config@1.1.1
  - @backstage/backend-tasks@0.5.14-next.1
  - @backstage/backend-plugin-api@0.6.9-next.1
  - @backstage/errors@1.2.3
  - @backstage-community/plugin-vault-node@0.1.2-next.1

## 0.4.2-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.20.1-next.0
  - @backstage/backend-plugin-api@0.6.9-next.0
  - @backstage/backend-tasks@0.5.14-next.0
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3
  - @backstage-community/plugin-vault-node@0.1.2-next.0

## 0.4.1

### Patch Changes

- b7de76a: Updated to test using PostgreSQL 12 and 16
- Updated dependencies
  - @backstage/backend-common@0.20.0
  - @backstage/backend-tasks@0.5.13
  - @backstage/backend-plugin-api@0.6.8
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3
  - @backstage-community/plugin-vault-node@0.1.1

## 0.4.1-next.3

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.20.0-next.3
  - @backstage/backend-plugin-api@0.6.8-next.3
  - @backstage/backend-tasks@0.5.13-next.3
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3
  - @backstage-community/plugin-vault-node@0.1.1-next.3

## 0.4.1-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.20.0-next.2
  - @backstage/backend-plugin-api@0.6.8-next.2
  - @backstage/backend-tasks@0.5.13-next.2
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3
  - @backstage-community/plugin-vault-node@0.1.1-next.2

## 0.4.1-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.20.0-next.1
  - @backstage/backend-plugin-api@0.6.8-next.1
  - @backstage/backend-tasks@0.5.13-next.1
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3
  - @backstage-community/plugin-vault-node@0.1.1-next.1

## 0.4.1-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.20.0-next.0
  - @backstage/backend-tasks@0.5.13-next.0
  - @backstage/backend-plugin-api@0.6.8-next.0
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3
  - @backstage-community/plugin-vault-node@0.1.1-next.0

## 0.4.0

### Minor Changes

- a873a32a1f: Added support for the [new backend system](https://backstage.io/docs/backend-system/).

  In your `packages/backend/src/index.ts` make the following changes:

  ```diff
    import { createBackend } from '@backstage/backend-defaults';
    const backend = createBackend();
    // ... other feature additions
  + backend.add(import('@backstage-community/plugin-vault-backend');
    backend.start();
  ```

  If you use the new backend system, the token renewal task can be defined via configuration file:

  ```diff
  vault:
    baseUrl: <BASE_URL>
    token: <TOKEN>
    schedule:
  +   frequency: ...
  +   timeout: ...
  +   # Other schedule options, such as scope or initialDelay
  ```

  If the `schedule` is omitted or set to `false` no token renewal task will be scheduled.
  If the value of `schedule` is set to `true` the renew will be scheduled hourly (the default).
  In other cases (like in the diff above), the defined schedule will be used.

  **DEPRECATIONS**: The interface `VaultApi` and the type `VaultSecret` are now deprecated. Import them from `@backstage-community/plugin-vault-node`.

### Patch Changes

- Updated dependencies
  - @backstage-community/plugin-vault-node@0.1.0
  - @backstage/backend-common@0.19.9
  - @backstage/backend-plugin-api@0.6.7
  - @backstage/backend-tasks@0.5.12
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3

## 0.4.0-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-plugin-api@0.6.7-next.2
  - @backstage/backend-common@0.19.9-next.2
  - @backstage/backend-tasks@0.5.12-next.2
  - @backstage-community/plugin-vault-node@0.1.0-next.2

## 0.4.0-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.9-next.1
  - @backstage/backend-tasks@0.5.12-next.1
  - @backstage/backend-plugin-api@0.6.7-next.1
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3
  - @backstage-community/plugin-vault-node@0.1.0-next.1

## 0.4.0-next.0

### Minor Changes

- a873a32a1f: Added support for the [new backend system](https://backstage.io/docs/backend-system/).

  In your `packages/backend/src/index.ts` make the following changes:

  ```diff
    import { createBackend } from '@backstage/backend-defaults';
    const backend = createBackend();
    // ... other feature additions
  + backend.add(import('@backstage-community/plugin-vault-backend');
    backend.start();
  ```

  If you use the new backend system, the token renewal task can be defined via configuration file:

  ```diff
  vault:
    baseUrl: <BASE_URL>
    token: <TOKEN>
    schedule:
  +   frequency: ...
  +   timeout: ...
  +   # Other schedule options, such as scope or initialDelay
  ```

  If the `schedule` is omitted or set to `false` no token renewal task will be scheduled.
  If the value of `schedule` is set to `true` the renew will be scheduled hourly (the default).
  In other cases (like in the diff above), the defined schedule will be used.

  **DEPRECATIONS**: The interface `VaultApi` and the type `VaultSecret` are now deprecated. Import them from `@backstage-community/plugin-vault-node`.

### Patch Changes

- Updated dependencies
  - @backstage-community/plugin-vault-node@0.1.0-next.0
  - @backstage/backend-common@0.19.9-next.0
  - @backstage/backend-plugin-api@0.6.7-next.0
  - @backstage/backend-tasks@0.5.12-next.0
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3

## 0.3.11

### Patch Changes

- Updated dependencies
  - @backstage/backend-tasks@0.5.11
  - @backstage/backend-common@0.19.8
  - @backstage/errors@1.2.3
  - @backstage/config@1.1.1

## 0.3.11-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.8-next.2
  - @backstage/errors@1.2.3-next.0
  - @backstage/backend-tasks@0.5.11-next.2
  - @backstage/config@1.1.1-next.0

## 0.3.10-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-tasks@0.5.10-next.1
  - @backstage/backend-common@0.19.7-next.1
  - @backstage/config@1.1.0
  - @backstage/errors@1.2.2

## 0.3.10-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.7-next.0
  - @backstage/config@1.1.0
  - @backstage/backend-tasks@0.5.10-next.0
  - @backstage/errors@1.2.2

## 0.3.8

### Patch Changes

- 858a18800870: Added ability to override vault secret engine value on catalog entity level using annotation `vault.io/secrets-engine`
- Updated dependencies
  - @backstage/backend-tasks@0.5.8
  - @backstage/backend-common@0.19.5
  - @backstage/config@1.1.0
  - @backstage/errors@1.2.2

## 0.3.7

Skipped due to publishing issues.

## 0.3.7-next.3

### Patch Changes

- 858a18800870: Added ability to override vault secret engine value on catalog entity level using annotation `vault.io/secrets-engine`
- Updated dependencies
  - @backstage/config@1.1.0-next.2
  - @backstage/errors@1.2.2-next.0
  - @backstage/backend-common@0.19.5-next.3
  - @backstage/backend-tasks@0.5.8-next.3

## 0.3.7-next.2

### Patch Changes

- Updated dependencies
  - @backstage/config@1.1.0-next.1
  - @backstage/backend-tasks@0.5.8-next.2
  - @backstage/backend-common@0.19.5-next.2
  - @backstage/errors@1.2.1

## 0.3.7-next.1

### Patch Changes

- Updated dependencies
  - @backstage/config@1.1.0-next.0
  - @backstage/backend-tasks@0.5.8-next.1
  - @backstage/backend-common@0.19.5-next.1
  - @backstage/errors@1.2.1

## 0.3.6-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.4-next.0
  - @backstage/backend-tasks@0.5.7-next.0
  - @backstage/config@1.0.8
  - @backstage/errors@1.2.1

## 0.3.4

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.2
  - @backstage/backend-tasks@0.5.5
  - @backstage/config@1.0.8
  - @backstage/errors@1.2.1

## 0.3.4-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-tasks@0.5.5-next.2
  - @backstage/backend-common@0.19.2-next.2

## 0.3.4-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.2-next.1
  - @backstage/backend-tasks@0.5.5-next.1
  - @backstage/config@1.0.8
  - @backstage/errors@1.2.1

## 0.3.4-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.2-next.0
  - @backstage/backend-tasks@0.5.5-next.0
  - @backstage/config@1.0.8
  - @backstage/errors@1.2.1

## 0.3.3

### Patch Changes

- Updated dependencies
  - @backstage/errors@1.2.1
  - @backstage/backend-common@0.19.1
  - @backstage/backend-tasks@0.5.4
  - @backstage/config@1.0.8

## 0.3.3-next.0

### Patch Changes

- Updated dependencies
  - @backstage/errors@1.2.1-next.0
  - @backstage/backend-common@0.19.1-next.0
  - @backstage/backend-tasks@0.5.4-next.0
  - @backstage/config@1.0.8

## 0.3.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.0
  - @backstage/errors@1.2.0
  - @backstage/backend-tasks@0.5.3
  - @backstage/config@1.0.8

## 0.3.2-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.0-next.2
  - @backstage/backend-tasks@0.5.3-next.2
  - @backstage/config@1.0.7
  - @backstage/errors@1.2.0-next.0

## 0.3.2-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.0-next.1
  - @backstage/errors@1.2.0-next.0
  - @backstage/backend-tasks@0.5.3-next.1
  - @backstage/config@1.0.7

## 0.3.2-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.6-next.0
  - @backstage/config@1.0.7
  - @backstage/backend-tasks@0.5.3-next.0
  - @backstage/errors@1.1.5

## 0.3.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.5
  - @backstage/backend-tasks@0.5.2
  - @backstage/config@1.0.7
  - @backstage/errors@1.1.5

## 0.3.1-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.5-next.1
  - @backstage/backend-tasks@0.5.2-next.1
  - @backstage/config@1.0.7

## 0.3.1-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.5-next.0
  - @backstage/backend-tasks@0.5.2-next.0
  - @backstage/config@1.0.7
  - @backstage/errors@1.1.5

## 0.3.0

### Minor Changes

- 5e959c9eb62: Allow generic Vault clients to be passed into the builder

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.4
  - @backstage/backend-tasks@0.5.1
  - @backstage/config@1.0.7
  - @backstage/errors@1.1.5

## 0.3.0-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.4-next.2
  - @backstage/backend-tasks@0.5.1-next.2
  - @backstage/config@1.0.7
  - @backstage/errors@1.1.5

## 0.3.0-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-tasks@0.5.1-next.1
  - @backstage/backend-common@0.18.4-next.1
  - @backstage/config@1.0.7
  - @backstage/errors@1.1.5

## 0.3.0-next.0

### Minor Changes

- 5e959c9eb62: Allow generic Vault clients to be passed into the builder

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.4-next.0
  - @backstage/config@1.0.7
  - @backstage/backend-tasks@0.5.1-next.0
  - @backstage/errors@1.1.5

## 0.2.10

### Patch Changes

- 66b3a3956b8: Ignore the `eslint` error
- 52b0022dab7: Updated dependency `msw` to `^1.0.0`.
- Updated dependencies
  - @backstage/backend-tasks@0.5.0
  - @backstage/backend-common@0.18.3
  - @backstage/errors@1.1.5
  - @backstage/config@1.0.7

## 0.2.10-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-tasks@0.5.0-next.2
  - @backstage/backend-common@0.18.3-next.2
  - @backstage/config@1.0.7-next.0

## 0.2.10-next.1

### Patch Changes

- 52b0022dab7: Updated dependency `msw` to `^1.0.0`.
- Updated dependencies
  - @backstage/errors@1.1.5-next.0
  - @backstage/backend-common@0.18.3-next.1
  - @backstage/backend-tasks@0.4.4-next.1
  - @backstage/config@1.0.7-next.0

## 0.2.10-next.0

### Patch Changes

- 66b3a3956b: Ignore the `eslint` error
- Updated dependencies
  - @backstage/backend-tasks@0.4.4-next.0
  - @backstage/backend-common@0.18.3-next.0
  - @backstage/config@1.0.6
  - @backstage/errors@1.1.4

## 0.2.8

### Patch Changes

- 5b7cd5580d: Moving the backend-test-utils to devDependencies.
- Updated dependencies
  - @backstage/backend-common@0.18.2
  - @backstage/backend-tasks@0.4.3
  - @backstage/config@1.0.6
  - @backstage/errors@1.1.4

## 0.2.8-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-test-utils@0.1.34-next.2
  - @backstage/backend-common@0.18.2-next.2
  - @backstage/backend-tasks@0.4.3-next.2
  - @backstage/config@1.0.6
  - @backstage/errors@1.1.4

## 0.2.8-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.2-next.1
  - @backstage/backend-tasks@0.4.3-next.1
  - @backstage/backend-test-utils@0.1.34-next.1
  - @backstage/config@1.0.6
  - @backstage/errors@1.1.4

## 0.2.8-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-test-utils@0.1.34-next.0
  - @backstage/backend-common@0.18.2-next.0
  - @backstage/backend-tasks@0.4.3-next.0

## 0.2.6

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.0
  - @backstage/backend-test-utils@0.1.32
  - @backstage/backend-tasks@0.4.1
  - @backstage/config@1.0.6
  - @backstage/errors@1.1.4

## 0.2.6-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-test-utils@0.1.32-next.2
  - @backstage/backend-common@0.18.0-next.1
  - @backstage/backend-tasks@0.4.1-next.1
  - @backstage/config@1.0.6-next.0
  - @backstage/errors@1.1.4

## 0.2.6-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-test-utils@0.1.32-next.1
  - @backstage/backend-common@0.18.0-next.0
  - @backstage/config@1.0.6-next.0
  - @backstage/backend-tasks@0.4.1-next.0
  - @backstage/errors@1.1.4

## 0.2.6-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.17.0
  - @backstage/backend-tasks@0.4.0
  - @backstage/backend-test-utils@0.1.32-next.0
  - @backstage/config@1.0.5
  - @backstage/errors@1.1.4

## 0.2.5

### Patch Changes

- 568ae02463: Added (optional) config `vault.publicUrl` as alternative to `vault.baseUrl` for `editUrl` and `showUrl` in case `vault.baseUrl` is internal
- 3280711113: Updated dependency `msw` to `^0.49.0`.
- 7a3d2688ed: Use `express-promise-router` to catch errors properly.
  Add `403` error as a known one. It will now return a `NotAllowed` error.
- Updated dependencies
  - @backstage/backend-common@0.17.0
  - @backstage/backend-tasks@0.4.0
  - @backstage/backend-test-utils@0.1.31
  - @backstage/errors@1.1.4
  - @backstage/config@1.0.5

## 0.2.5-next.4

### Patch Changes

- Updated dependencies
  - @backstage/backend-tasks@0.4.0-next.3
  - @backstage/backend-common@0.17.0-next.3
  - @backstage/backend-test-utils@0.1.31-next.4
  - @backstage/config@1.0.5-next.1
  - @backstage/errors@1.1.4-next.1

## 0.2.5-next.3

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.17.0-next.2
  - @backstage/backend-tasks@0.4.0-next.2
  - @backstage/backend-test-utils@0.1.31-next.3
  - @backstage/config@1.0.5-next.1
  - @backstage/errors@1.1.4-next.1

## 0.2.5-next.2

### Patch Changes

- 568ae02463: Added (optional) config `vault.publicUrl` as alternative to `vault.baseUrl` for `editUrl` and `showUrl` in case `vault.baseUrl` is internal
- Updated dependencies
  - @backstage/backend-common@0.17.0-next.2
  - @backstage/backend-test-utils@0.1.31-next.2
  - @backstage/backend-tasks@0.4.0-next.2
  - @backstage/config@1.0.5-next.1
  - @backstage/errors@1.1.4-next.1

## 0.2.5-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.17.0-next.1
  - @backstage/backend-tasks@0.4.0-next.1
  - @backstage/backend-test-utils@0.1.31-next.1
  - @backstage/config@1.0.5-next.1
  - @backstage/errors@1.1.4-next.1

## 0.2.5-next.0

### Patch Changes

- 3280711113: Updated dependency `msw` to `^0.49.0`.
- 7a3d2688ed: Use `express-promise-router` to catch errors properly.
  Add `403` error as a known one. It will now return a `NotAllowed` error.
- Updated dependencies
  - @backstage/backend-common@0.16.1-next.0
  - @backstage/backend-test-utils@0.1.31-next.0
  - @backstage/backend-tasks@0.3.8-next.0
  - @backstage/config@1.0.5-next.0
  - @backstage/errors@1.1.4-next.0

## 0.2.4

### Patch Changes

- 687237da4c: Added `errorHandler()` middleware to `router` to prevent crashes caused by fatal errors in plugin backend
- Updated dependencies
  - @backstage/backend-common@0.16.0
  - @backstage/backend-tasks@0.3.7
  - @backstage/backend-test-utils@0.1.30
  - @backstage/config@1.0.4
  - @backstage/errors@1.1.3

## 0.2.4-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.16.0-next.1
  - @backstage/backend-tasks@0.3.7-next.1
  - @backstage/backend-test-utils@0.1.30-next.1
  - @backstage/config@1.0.4-next.0
  - @backstage/errors@1.1.3-next.0

## 0.2.4-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.16.0-next.0
  - @backstage/backend-tasks@0.3.7-next.0
  - @backstage/backend-test-utils@0.1.30-next.0
  - @backstage/config@1.0.4-next.0
  - @backstage/errors@1.1.3-next.0

## 0.2.3

### Patch Changes

- 9c595302cb: Normalize on winston version ^3.2.1
- dae0bbe522: VaultBuilder.tsx renamed to VaultBuilder in order for module to be correctly loaded.
- Updated dependencies
  - @backstage/backend-common@0.15.2
  - @backstage/backend-test-utils@0.1.29
  - @backstage/backend-tasks@0.3.6
  - @backstage/config@1.0.3
  - @backstage/errors@1.1.2

## 0.2.3-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-tasks@0.3.6-next.2
  - @backstage/backend-common@0.15.2-next.2
  - @backstage/backend-test-utils@0.1.29-next.2
  - @backstage/config@1.0.3-next.2
  - @backstage/errors@1.1.2-next.2

## 0.2.3-next.1

### Patch Changes

- dae0bbe522: VaultBuilder.tsx renamed to VaultBuilder in order for module to be correctly loaded.
- Updated dependencies
  - @backstage/backend-common@0.15.2-next.1
  - @backstage/backend-tasks@0.3.6-next.1
  - @backstage/backend-test-utils@0.1.29-next.1
  - @backstage/config@1.0.3-next.1
  - @backstage/errors@1.1.2-next.1

## 0.2.3-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-test-utils@0.1.29-next.0
  - @backstage/backend-common@0.15.2-next.0
  - @backstage/backend-tasks@0.3.6-next.0
  - @backstage/config@1.0.3-next.0
  - @backstage/errors@1.1.2-next.0

## 0.2.2

### Patch Changes

- 3f739be9d9: Minor API signatures cleanup
- 148568b5c2: Switched to using node-fetch instead of cross-fetch as is standard for our backend packages
- 60b85d8ade: Updated dependency `helmet` to `^6.0.0`.

  Please note that these policies are no longer applied by default:

  helmet.contentSecurityPolicy no longer sets block-all-mixed-content directive by default
  helmet.expectCt is no longer set by default. It can, however, be explicitly enabled. It will be removed in Helmet 7.

- 667d917488: Updated dependency `msw` to `^0.47.0`.
- 87ec2ba4d6: Updated dependency `msw` to `^0.46.0`.
- bf5e9030eb: Updated dependency `msw` to `^0.45.0`.
- Updated dependencies
  - @backstage/backend-common@0.15.1
  - @backstage/backend-tasks@0.3.5
  - @backstage/config@1.0.2
  - @backstage/errors@1.1.1
  - @backstage/backend-test-utils@0.1.28

## 0.2.2-next.3

### Patch Changes

- Updated dependencies
  - @backstage/config@1.0.2-next.0
  - @backstage/errors@1.1.1-next.0
  - @backstage/backend-test-utils@0.1.28-next.3
  - @backstage/backend-common@0.15.1-next.3
  - @backstage/backend-tasks@0.3.5-next.1

## 0.2.2-next.2

### Patch Changes

- 667d917488: Updated dependency `msw` to `^0.47.0`.
- 87ec2ba4d6: Updated dependency `msw` to `^0.46.0`.
- Updated dependencies
  - @backstage/backend-common@0.15.1-next.2
  - @backstage/backend-test-utils@0.1.28-next.2

## 0.2.2-next.1

### Patch Changes

- 148568b5c2: Switched to using node-fetch instead of cross-fetch as is standard for our backend packages
- 60b85d8ade: Updated dependency `helmet` to `^6.0.0`.

  Please note that these policies are no longer applied by default:

  helmet.contentSecurityPolicy no longer sets block-all-mixed-content directive by default
  helmet.expectCt is no longer set by default. It can, however, be explicitly enabled. It will be removed in Helmet 7.

- Updated dependencies
  - @backstage/backend-common@0.15.1-next.1
  - @backstage/backend-test-utils@0.1.28-next.1

## 0.2.2-next.0

### Patch Changes

- 3f739be9d9: Minor API signatures cleanup
- bf5e9030eb: Updated dependency `msw` to `^0.45.0`.
- Updated dependencies
  - @backstage/backend-common@0.15.1-next.0
  - @backstage/backend-tasks@0.3.5-next.0
  - @backstage/backend-test-utils@0.1.28-next.0

## 0.2.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.15.0
  - @backstage/backend-test-utils@0.1.27
  - @backstage/backend-tasks@0.3.4

## 0.2.1-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.15.0-next.0
  - @backstage/backend-tasks@0.3.4-next.0
  - @backstage/backend-test-utils@0.1.27-next.0

## 0.2.0

### Minor Changes

- 5ebf2c7023: Throw exceptions instead of swallow them, remove some exported types from the `api-report`, small changes in the API responses & expose the vault `baseUrl` to the frontend as well

### Patch Changes

- 7ee4abdcc9: Added a path notion in addition to secret name to allow to differentiate secrets in sub-paths
- a70869e775: Updated dependency `msw` to `^0.43.0`.
- 8006d0f9bf: Updated dependency `msw` to `^0.44.0`.
- Updated dependencies
  - @backstage/backend-common@0.14.1
  - @backstage/backend-test-utils@0.1.26
  - @backstage/backend-tasks@0.3.3
  - @backstage/errors@1.1.0

## 0.2.0-next.3

### Patch Changes

- a70869e775: Updated dependency `msw` to `^0.43.0`.
- Updated dependencies
  - @backstage/backend-common@0.14.1-next.3
  - @backstage/backend-test-utils@0.1.26-next.3
  - @backstage/backend-tasks@0.3.3-next.3

## 0.2.0-next.2

### Patch Changes

- 7ee4abdcc9: Added a path notion in addition to secret name to allow to differentiate secrets in sub-paths
- Updated dependencies
  - @backstage/backend-common@0.14.1-next.2
  - @backstage/backend-tasks@0.3.3-next.2
  - @backstage/backend-test-utils@0.1.26-next.2

## 0.2.0-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.14.1-next.1
  - @backstage/errors@1.1.0-next.0
  - @backstage/backend-tasks@0.3.3-next.1
  - @backstage/backend-test-utils@0.1.26-next.1

## 0.2.0-next.0

### Minor Changes

- 5ebf2c7023: Throw exceptions instead of swallow them, remove some exported types from the `api-report`, small changes in the API responses & expose the vault `baseUrl` to the frontend as well

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.14.1-next.0
  - @backstage/backend-tasks@0.3.3-next.0
  - @backstage/backend-test-utils@0.1.26-next.0

## 0.1.0

### Minor Changes

- 7c310a5bc2: First implementation for the backend vault plugin. For more information refer to its `README.md`.

### Patch Changes

- Updated dependencies
  - @backstage/backend-tasks@0.3.2
  - @backstage/backend-common@0.14.0
  - @backstage/backend-test-utils@0.1.25
