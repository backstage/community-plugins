### Dependencies

## 1.29.6

### Patch Changes

- a6e850f: Updated dependency `msw` to `1.3.5`.

## 1.29.5

### Patch Changes

- 72f0537: Update topology dev pages (requires an additional permission dependency). This should not affect users.

## 1.29.4

### Patch Changes

- e5c3246: Added `prepublish` script to correct `style-inject` module path references in packed files, ensuring proper resolution and avoiding runtime errors in the published package. And reverted `build` script.

## 1.29.3

### Patch Changes

- a2c5a0a: Updated the `build` script to correct `style-inject` module path references in packed files, ensuring proper resolution and avoiding runtime errors in the published package.
- a2c5a0a: Added `build:all` script to trigger `prepare` script in release process and removed `postversion` script.

## 1.29.2

### Patch Changes

- 232c0e7: Added `build:all` script to trigger `prepare` script in release process and removed `postversion` script.

## 1.29.1

### Patch Changes

- 833d4dd: Resolved issues with the style-inject module path references in the npm package to ensure proper loading.
- e77652d: Bump up share-react version to ^2.13.1 and updated supported-versions to ^1.28.4.
- Updated dependencies [e77652d]
  - @backstage-community/plugin-topology-common@1.4.3

## 1.29.0

### Minor Changes

- 730359c: Migrated to MUI5

### Patch Changes

- 694e163: - Fixed an issue with the topology node badge icon text color.
  - Updated the stylesheet link filter string to accommodate the new topology package name.
  - Removed `janus-idp/cli` from `devDependencies` as `export-dynamic` is no longer needed for the topology plugin package.

## 1.28.4

### Patch Changes

- 3865528: Fix CVE by upgrading kubernetes-client to v0.22.1
- 62a2d24: Backstage version bump to v1.32.2
- Updated dependencies [62a2d24]
  - @backstage-community/plugin-topology-common@1.4.2

## 1.28.3

### Patch Changes

- 5dd7d77: The `topology` and `topology-common` plugins from the [janus-idp/backstage-plugins](https://github.com/janus-idp/backstage-plugins) repository were migrated to the community plugins. The migration was performed by following the manual migration steps outlined in the [Community Plugins CONTRIBUTING guide](https://github.com/backstage/community-plugins/blob/main/CONTRIBUTING.md#migrating-a-plugin)
- Updated dependencies [5dd7d77]

  - @backstage-community/plugin-topology-common@1.4.1

- **@janus-idp/cli:** upgraded to 1.15.1

### Dependencies

- **@janus-idp/shared-react:** upgraded to 2.11.1
- **@janus-idp/cli:** upgraded to 1.15.0

### Dependencies

- **@janus-idp/backstage-plugin-topology-common:** upgraded to 1.4.0
- **@janus-idp/shared-react:** upgraded to 2.11.0
- **@janus-idp/cli:** upgraded to 1.14.0

### Dependencies

- **@janus-idp/cli:** upgraded to 1.13.2

### Dependencies

- **@janus-idp/shared-react:** upgraded to 2.10.3

### Dependencies

- **@janus-idp/shared-react:** upgraded to 2.10.2

### Dependencies

- **@janus-idp/shared-react:** upgraded to 2.10.1

### Dependencies

- **@janus-idp/cli:** upgraded to 1.13.1

## @janus-idp/backstage-plugin-topology [1.25.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.24.0...@janus-idp/backstage-plugin-topology@1.25.0) (2024-08-05)

### Features

- **topology:** remove usage of k8s plugin from topology & tekton plugins ([#1869](https://github.com/janus-idp/backstage-plugins/issues/1869)) ([ae7d8ee](https://github.com/janus-idp/backstage-plugins/commit/ae7d8ee7014c109a5f5265967590559fc778eec7))

### Bug Fixes

- **topology:** bump shared-react dependency ([#2006](https://github.com/janus-idp/backstage-plugins/issues/2006)) ([5c939fb](https://github.com/janus-idp/backstage-plugins/commit/5c939fb2a874061dcf9805f9a5027845b9481eb1))

## @janus-idp/backstage-plugin-topology [1.24.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.23.1...@janus-idp/backstage-plugin-topology@1.24.0) (2024-07-26)

### Features

- **deps:** update to backstage 1.29 ([#1900](https://github.com/janus-idp/backstage-plugins/issues/1900)) ([f53677f](https://github.com/janus-idp/backstage-plugins/commit/f53677fb02d6df43a9de98c43a9f101a6db76802))

### Dependencies

- **@janus-idp/backstage-plugin-topology-common:** upgraded to 1.3.0
- **@janus-idp/shared-react:** upgraded to 2.9.0

## @janus-idp/backstage-plugin-topology [1.23.1](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.23.0...@janus-idp/backstage-plugin-topology@1.23.1) (2024-07-24)

### Bug Fixes

- **deps:** rollback unreleased plugins ([#1951](https://github.com/janus-idp/backstage-plugins/issues/1951)) ([8b77969](https://github.com/janus-idp/backstage-plugins/commit/8b779694f02f8125587296305276b84cdfeeaebe))

### Dependencies

- **@janus-idp/backstage-plugin-topology-common:** upgraded to 1.2.2

## @janus-idp/backstage-plugin-topology [1.23.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.22.1...@janus-idp/backstage-plugin-topology@1.23.0) (2024-07-24)

### Features

- **deps:** update to backstage 1.28 ([#1891](https://github.com/janus-idp/backstage-plugins/issues/1891)) ([1ba1108](https://github.com/janus-idp/backstage-plugins/commit/1ba11088e0de60e90d138944267b83600dc446e5))

### Dependencies

- **@janus-idp/shared-react:** upgraded to 2.8.0

## @janus-idp/backstage-plugin-topology [1.22.1](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.22.0...@janus-idp/backstage-plugin-topology@1.22.1) (2024-06-19)

### Dependencies

- **@janus-idp/shared-react:** upgraded to 2.7.1
- **@janus-idp/cli:** upgraded to 1.11.1

## @janus-idp/backstage-plugin-topology [1.22.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.21.11...@janus-idp/backstage-plugin-topology@1.22.0) (2024-06-13)

### Features

- **deps:** update to backstage 1.27 ([#1683](https://github.com/janus-idp/backstage-plugins/issues/1683)) ([a14869c](https://github.com/janus-idp/backstage-plugins/commit/a14869c3f4177049cb8d6552b36c3ffd17e7997d))

### Dependencies

- **@janus-idp/backstage-plugin-topology-common:** upgraded to 1.1.0
- **@janus-idp/shared-react:** upgraded to 2.7.0
- **@janus-idp/cli:** upgraded to 1.11.0

## @janus-idp/backstage-plugin-topology [1.21.11](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.21.10...@janus-idp/backstage-plugin-topology@1.21.11) (2024-06-13)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.10.1

## @janus-idp/backstage-plugin-topology [1.21.10](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.21.9...@janus-idp/backstage-plugin-topology@1.21.10) (2024-06-07)

### Bug Fixes

- **topology:** remove check for catalog entity permission ([#1800](https://github.com/janus-idp/backstage-plugins/issues/1800)) ([fd6ae41](https://github.com/janus-idp/backstage-plugins/commit/fd6ae41f8d4438f58d74dbf1163df25c335eef61))

## @janus-idp/backstage-plugin-topology [1.21.9](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.21.8...@janus-idp/backstage-plugin-topology@1.21.9) (2024-06-05)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.10.0

## @janus-idp/backstage-plugin-topology [1.21.8](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.21.7...@janus-idp/backstage-plugin-topology@1.21.8) (2024-06-04)

### Dependencies

- **@janus-idp/backstage-plugin-topology-common:** upgraded to 1.0.2

## @janus-idp/backstage-plugin-topology [1.21.7](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.21.6...@janus-idp/backstage-plugin-topology@1.21.7) (2024-06-03)

## @janus-idp/backstage-plugin-topology [1.21.6](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.21.5...@janus-idp/backstage-plugin-topology@1.21.6) (2024-06-03)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.9.0

## @janus-idp/backstage-plugin-topology [1.21.5](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.21.4...@janus-idp/backstage-plugin-topology@1.21.5) (2024-05-31)

## @janus-idp/backstage-plugin-topology [1.21.4](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.21.3...@janus-idp/backstage-plugin-topology@1.21.4) (2024-05-30)

### Dependencies

- **@janus-idp/backstage-plugin-topology-common:** upgraded to 1.0.0

## @janus-idp/backstage-plugin-topology [1.21.3](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.21.2...@janus-idp/backstage-plugin-topology@1.21.3) (2024-05-30)

### Dependencies

- **@janus-idp/backstage-plugin-topology-common:** upgraded to 1.0.0

## @janus-idp/backstage-plugin-topology [1.21.2](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.21.1...@janus-idp/backstage-plugin-topology@1.21.2) (2024-05-30)

### Dependencies

- **@janus-idp/backstage-plugin-topology-common:** upgraded to 1.0.0

## @janus-idp/backstage-plugin-topology [1.21.1](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.21.0...@janus-idp/backstage-plugin-topology@1.21.1) (2024-05-29)

### Dependencies

- **@janus-idp/backstage-plugin-topology-common:** upgraded to 1.0.0
- **@janus-idp/cli:** upgraded to 1.8.10

## @janus-idp/backstage-plugin-topology [1.21.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.20.2...@janus-idp/backstage-plugin-topology@1.21.0) (2024-05-21)

### Features

- **topology:** add permissions to topology plugin ([#1665](https://github.com/janus-idp/backstage-plugins/issues/1665)) ([9d8f244](https://github.com/janus-idp/backstage-plugins/commit/9d8f244ae136cdf1980a5abf416180bce3f235ea))

## @janus-idp/backstage-plugin-topology [1.20.2](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.20.1...@janus-idp/backstage-plugin-topology@1.20.2) (2024-05-16)

## @janus-idp/backstage-plugin-topology [1.20.1](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.20.0...@janus-idp/backstage-plugin-topology@1.20.1) (2024-05-16)

### Dependencies

- **@janus-idp/shared-react:** upgraded to 2.6.2
- **@janus-idp/cli:** upgraded to 1.8.7

## @janus-idp/backstage-plugin-topology [1.20.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.19.5...@janus-idp/backstage-plugin-topology@1.20.0) (2024-05-14)

### Features

- **deps:** use RHDH themes in the backstage app and dev pages ([#1480](https://github.com/janus-idp/backstage-plugins/issues/1480)) ([8263bf0](https://github.com/janus-idp/backstage-plugins/commit/8263bf099736cbb0d0f2316082d338ba81fa6927))

## @janus-idp/backstage-plugin-topology [1.19.5](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.19.4...@janus-idp/backstage-plugin-topology@1.19.5) (2024-05-09)

### Dependencies

- **@janus-idp/shared-react:** upgraded to 2.6.1
- **@janus-idp/cli:** upgraded to 1.8.6

## @janus-idp/backstage-plugin-topology [1.19.4](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.19.3...@janus-idp/backstage-plugin-topology@1.19.4) (2024-05-02)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.8.5

## @janus-idp/backstage-plugin-topology [1.19.3](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.19.2...@janus-idp/backstage-plugin-topology@1.19.3) (2024-05-02)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.8.4

## @janus-idp/backstage-plugin-topology [1.19.2](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.19.1...@janus-idp/backstage-plugin-topology@1.19.2) (2024-04-30)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.8.3

## @janus-idp/backstage-plugin-topology [1.19.1](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.19.0...@janus-idp/backstage-plugin-topology@1.19.1) (2024-04-30)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.8.2

## @janus-idp/backstage-plugin-topology [1.19.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.18.14...@janus-idp/backstage-plugin-topology@1.19.0) (2024-04-15)

### Features

- checkPluginVersion.sh bump plugins for 1.2.0 release ([#1511](https://github.com/janus-idp/backstage-plugins/issues/1511)) ([73c6588](https://github.com/janus-idp/backstage-plugins/commit/73c6588adb7e8c20907b06f2a8ef248cfd4332e4))

### Dependencies

- **@janus-idp/shared-react:** upgraded to 2.6.0
- **@janus-idp/cli:** upgraded to 1.8.0

## @janus-idp/backstage-plugin-topology [1.18.14](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.18.13...@janus-idp/backstage-plugin-topology@1.18.14) (2024-04-09)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.7.10

## @janus-idp/backstage-plugin-topology [1.18.13](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.18.12...@janus-idp/backstage-plugin-topology@1.18.13) (2024-04-09)

### Dependencies

- **@janus-idp/shared-react:** upgraded to 2.5.5

## @janus-idp/backstage-plugin-topology [1.18.12](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.18.11...@janus-idp/backstage-plugin-topology@1.18.12) (2024-04-09)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.7.9

## @janus-idp/backstage-plugin-topology [1.18.11](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.18.10...@janus-idp/backstage-plugin-topology@1.18.11) (2024-04-08)

### Dependencies

- **@janus-idp/shared-react:** upgraded to 2.5.4

## @janus-idp/backstage-plugin-topology [1.18.10](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.18.9...@janus-idp/backstage-plugin-topology@1.18.10) (2024-04-02)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.7.7

## @janus-idp/backstage-plugin-topology [1.18.9](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.18.8...@janus-idp/backstage-plugin-topology@1.18.9) (2024-03-29)

### Dependencies

- **@janus-idp/shared-react:** upgraded to 2.5.3
- **@janus-idp/cli:** upgraded to 1.7.6

## @janus-idp/backstage-plugin-topology [1.18.8](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.18.7...@janus-idp/backstage-plugin-topology@1.18.8) (2024-03-26)

### Bug Fixes

- **topology:** adds check on service and routes to match same namespace as workloads ([#1389](https://github.com/janus-idp/backstage-plugins/issues/1389)) ([b8c217a](https://github.com/janus-idp/backstage-plugins/commit/b8c217ac153a16993867a0d4ba9377d08dc718ba))

## @janus-idp/backstage-plugin-topology [1.18.7](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.18.6...@janus-idp/backstage-plugin-topology@1.18.7) (2024-03-04)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.7.5

## @janus-idp/backstage-plugin-topology [1.18.6](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.18.5...@janus-idp/backstage-plugin-topology@1.18.6) (2024-02-27)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.7.4

## @janus-idp/backstage-plugin-topology [1.18.5](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.18.4...@janus-idp/backstage-plugin-topology@1.18.5) (2024-02-26)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.7.3

## @janus-idp/backstage-plugin-topology [1.18.4](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.18.3...@janus-idp/backstage-plugin-topology@1.18.4) (2024-02-21)

### Dependencies

- **@janus-idp/shared-react:** upgraded to 2.5.2
- **@janus-idp/cli:** upgraded to 1.7.2

## @janus-idp/backstage-plugin-topology [1.18.3](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.18.2...@janus-idp/backstage-plugin-topology@1.18.3) (2024-02-12)

### Bug Fixes

- **topology:** fix to layout nodes correctly on first load ([#1194](https://github.com/janus-idp/backstage-plugins/issues/1194)) ([30b4902](https://github.com/janus-idp/backstage-plugins/commit/30b4902811f24159b91c43336b73510d6531f74b)), closes [#2](https://github.com/janus-idp/backstage-plugins/issues/2)

## @janus-idp/backstage-plugin-topology [1.18.2](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.18.1...@janus-idp/backstage-plugin-topology@1.18.2) (2024-02-07)

### Bug Fixes

- **topology/tekton:** stop polling after log streaming completes ([#1122](https://github.com/janus-idp/backstage-plugins/issues/1122)) ([191bac2](https://github.com/janus-idp/backstage-plugins/commit/191bac2d21259b4fdc42193c6cf436987968eb88))

## @janus-idp/backstage-plugin-topology [1.18.1](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.18.0...@janus-idp/backstage-plugin-topology@1.18.1) (2024-02-05)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.7.1

## @janus-idp/backstage-plugin-topology [1.18.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.17.7...@janus-idp/backstage-plugin-topology@1.18.0) (2024-02-02)

### Features

- **topology:** added default runtime icon to topology nodes ([#1157](https://github.com/janus-idp/backstage-plugins/issues/1157)) ([5a8b27d](https://github.com/janus-idp/backstage-plugins/commit/5a8b27d01672d1dd0eb92eeb2429f36e2745409a))

### Dependencies

- **@janus-idp/shared-react:** upgraded to 2.5.1

## @janus-idp/backstage-plugin-topology [1.17.7](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.17.6...@janus-idp/backstage-plugin-topology@1.17.7) (2024-01-30)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.7.0

## @janus-idp/backstage-plugin-topology [1.17.6](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.17.5...@janus-idp/backstage-plugin-topology@1.17.6) (2024-01-30)

### Dependencies

- **@janus-idp/shared-react:** upgraded to 2.5.0

## @janus-idp/backstage-plugin-topology [1.17.5](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.17.4...@janus-idp/backstage-plugin-topology@1.17.5) (2024-01-29)

### Documentation

- **topology:** updated topology readme and clusterrole manifest ([#1106](https://github.com/janus-idp/backstage-plugins/issues/1106)) ([9180e82](https://github.com/janus-idp/backstage-plugins/commit/9180e82a397266f5d88b6caa24524171c30f0ef4))

## @janus-idp/backstage-plugin-topology [1.17.4](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.17.3...@janus-idp/backstage-plugin-topology@1.17.4) (2024-01-25)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.6.0

## @janus-idp/backstage-plugin-topology [1.17.3](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.17.2...@janus-idp/backstage-plugin-topology@1.17.3) (2024-01-17)

### Dependencies

- **@janus-idp/shared-react:** upgraded to 2.4.0

## @janus-idp/backstage-plugin-topology [1.17.2](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.17.1...@janus-idp/backstage-plugin-topology@1.17.2) (2023-12-22)

### Dependencies

- **@janus-idp/shared-react:** upgraded to 2.3.0

## @janus-idp/backstage-plugin-topology [1.17.1](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.17.0...@janus-idp/backstage-plugin-topology@1.17.1) (2023-12-20)

### Dependencies

- **@janus-idp/shared-react:** upgraded to 2.2.0

## @janus-idp/backstage-plugin-topology [1.17.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.16.14...@janus-idp/backstage-plugin-topology@1.17.0) (2023-12-14)

### Features

- **tekton:** add support for downloading task and pipelinerun logs ([#1014](https://github.com/janus-idp/backstage-plugins/issues/1014)) ([f588292](https://github.com/janus-idp/backstage-plugins/commit/f5882921756a7aa6d5a74d8fdb6bfc52a7c0c209))

### Dependencies

- **@janus-idp/shared-react:** upgraded to 2.1.0

## @janus-idp/backstage-plugin-topology [1.16.14](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.16.13...@janus-idp/backstage-plugin-topology@1.16.14) (2023-12-07)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.4.7

## @janus-idp/backstage-plugin-topology [1.16.13](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.16.12...@janus-idp/backstage-plugin-topology@1.16.13) (2023-11-30)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.4.6

## @janus-idp/backstage-plugin-topology [1.16.12](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.16.11...@janus-idp/backstage-plugin-topology@1.16.12) (2023-11-23)

### Bug Fixes

- add config partials for dynamic frontend plugins ([#965](https://github.com/janus-idp/backstage-plugins/issues/965)) ([b01e55e](https://github.com/janus-idp/backstage-plugins/commit/b01e55e877278afc5de8d28a4c687a6989566bdc))

## @janus-idp/backstage-plugin-topology [1.16.11](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.16.10...@janus-idp/backstage-plugin-topology@1.16.11) (2023-11-23)

### Bug Fixes

- **tekton:** update tekton version in the documentation ([#958](https://github.com/janus-idp/backstage-plugins/issues/958)) ([51cc924](https://github.com/janus-idp/backstage-plugins/commit/51cc924b1341d04aa75a1713713c8a6700b2c0a3))

### Dependencies

- **@janus-idp/shared-react:** upgraded to 2.0.1

## @janus-idp/backstage-plugin-topology [1.16.10](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.16.9...@janus-idp/backstage-plugin-topology@1.16.10) (2023-11-22)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.4.5

## @janus-idp/backstage-plugin-topology [1.16.9](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.16.8...@janus-idp/backstage-plugin-topology@1.16.9) (2023-11-21)

### Bug Fixes

- sync versions in dynamic assets and publish derived packages as additional packages ([#963](https://github.com/janus-idp/backstage-plugins/issues/963)) ([7d0a386](https://github.com/janus-idp/backstage-plugins/commit/7d0a38609b4a18b54c75378a150e8b5c3ba8ff43))

## @janus-idp/backstage-plugin-topology [1.16.8](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.16.7...@janus-idp/backstage-plugin-topology@1.16.8) (2023-11-20)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.4.4

## @janus-idp/backstage-plugin-topology [1.16.7](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.16.6...@janus-idp/backstage-plugin-topology@1.16.7) (2023-11-16)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.4.3

## @janus-idp/backstage-plugin-topology [1.16.6](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.16.5...@janus-idp/backstage-plugin-topology@1.16.6) (2023-11-13)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.4.2

## @janus-idp/backstage-plugin-topology [1.16.5](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.16.4...@janus-idp/backstage-plugin-topology@1.16.5) (2023-11-13)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.4.1

## @janus-idp/backstage-plugin-topology [1.16.4](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.16.3...@janus-idp/backstage-plugin-topology@1.16.4) (2023-11-07)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.4.0

## @janus-idp/backstage-plugin-topology [1.16.3](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.16.2...@janus-idp/backstage-plugin-topology@1.16.3) (2023-11-06)

### Bug Fixes

- **cli:** add default scalprum config ([#909](https://github.com/janus-idp/backstage-plugins/issues/909)) ([d74fc72](https://github.com/janus-idp/backstage-plugins/commit/d74fc72ab7e0a843da047c7b6570d8a6fbc068e1))

### Dependencies

- **@janus-idp/cli:** upgraded to 1.3.3

## @janus-idp/backstage-plugin-topology [1.16.2](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.16.1...@janus-idp/backstage-plugin-topology@1.16.2) (2023-11-06)

### Documentation

- update frontend plugin docs to use EntityLayout instead of EntityPageLayout ([#907](https://github.com/janus-idp/backstage-plugins/issues/907)) ([aa91bba](https://github.com/janus-idp/backstage-plugins/commit/aa91bba4c7a43de416258eb019724e21c7cf4bb8))

## @janus-idp/backstage-plugin-topology [1.16.1](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.16.0...@janus-idp/backstage-plugin-topology@1.16.1) (2023-11-02)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.3.2

## @janus-idp/backstage-plugin-topology [1.16.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.15.9...@janus-idp/backstage-plugin-topology@1.16.0) (2023-11-01)

### Features

- **dynamic-plugins:** publish dynamic assets for all frontend plugins ([#896](https://github.com/janus-idp/backstage-plugins/issues/896)) ([dcfb0ac](https://github.com/janus-idp/backstage-plugins/commit/dcfb0ac56769c82f6b8b2cef2726251e0b60c375))

## @janus-idp/backstage-plugin-topology [1.15.9](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.15.8...@janus-idp/backstage-plugin-topology@1.15.9) (2023-10-23)

### Dependencies

- **@janus-idp/shared-react:** upgraded to 2.0.0

## @janus-idp/backstage-plugin-topology [1.15.8](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.15.7...@janus-idp/backstage-plugin-topology@1.15.8) (2023-10-19)

### Dependencies

- **@janus-idp/shared-react:** upgraded to 1.3.3

## @janus-idp/backstage-plugin-topology [1.15.7](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.15.6...@janus-idp/backstage-plugin-topology@1.15.7) (2023-10-16)

### Bug Fixes

- **tekton:** fix pipelinerun status icon color ([#734](https://github.com/janus-idp/backstage-plugins/issues/734)) ([c800f98](https://github.com/janus-idp/backstage-plugins/commit/c800f987afc9a96bec93c13295d8fdb0c5964a93))

### Dependencies

- **@janus-idp/shared-react:** upgraded to 1.3.2

## @janus-idp/backstage-plugin-topology [1.15.6](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.15.5...@janus-idp/backstage-plugin-topology@1.15.6) (2023-09-22)

### Bug Fixes

- **topology:** checluster resource to have matching labels for catalog entity ([#730](https://github.com/janus-idp/backstage-plugins/issues/730)) ([4576f6d](https://github.com/janus-idp/backstage-plugins/commit/4576f6db7789bf6c2fc7f5dcbd7af7c8ffbe7bab))
- **topology:** fix pipelinerun status icon color ([#732](https://github.com/janus-idp/backstage-plugins/issues/732)) ([55679af](https://github.com/janus-idp/backstage-plugins/commit/55679af65c891a2a872431266d2f49fe90682a4a))
- **topology:** fixes crash on dev setup for k8s tab ([#723](https://github.com/janus-idp/backstage-plugins/issues/723)) ([8035098](https://github.com/janus-idp/backstage-plugins/commit/80350982621773efbe701614a29ed883030585b2))

### Documentation

- **topology:** updates topology readme ([#764](https://github.com/janus-idp/backstage-plugins/issues/764)) ([9f3a31c](https://github.com/janus-idp/backstage-plugins/commit/9f3a31c25996ba06a0d360b5fac559cb721ec109))

### Dependencies

- **@janus-idp/shared-react:** upgraded to 1.3.1

## @janus-idp/backstage-plugin-topology [1.15.5](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.15.4...@janus-idp/backstage-plugin-topology@1.15.5) (2023-09-11)

## @janus-idp/backstage-plugin-topology [1.15.4](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.15.3...@janus-idp/backstage-plugin-topology@1.15.4) (2023-08-31)

## @janus-idp/backstage-plugin-topology [1.15.3](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.15.2...@janus-idp/backstage-plugin-topology@1.15.3) (2023-08-30)

### Bug Fixes

- **topology:** fix code smells ([#671](https://github.com/janus-idp/backstage-plugins/issues/671)) ([9743d86](https://github.com/janus-idp/backstage-plugins/commit/9743d86a76e9155e39769b61adcbe25d35b58f00))

## @janus-idp/backstage-plugin-topology [1.15.2](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.15.1...@janus-idp/backstage-plugin-topology@1.15.2) (2023-08-29)

### Documentation

- **topology:** update README.md ([#678](https://github.com/janus-idp/backstage-plugins/issues/678)) ([4f08af3](https://github.com/janus-idp/backstage-plugins/commit/4f08af3a6e716f6b584c827b2723cc75abda1fac))

## @janus-idp/backstage-plugin-topology [1.15.1](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.15.0...@janus-idp/backstage-plugin-topology@1.15.1) (2023-08-24)

### Documentation

- update tekton and topology documentation with pod log permissions ([#668](https://github.com/janus-idp/backstage-plugins/issues/668)) ([5b0a9f7](https://github.com/janus-idp/backstage-plugins/commit/5b0a9f77448d624c50f58e19d7f439700bef9cfe))

## @janus-idp/backstage-plugin-topology [1.15.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.14.3...@janus-idp/backstage-plugin-topology@1.15.0) (2023-08-14)

### Features

- **ts:** transpile each plugin separately ([#634](https://github.com/janus-idp/backstage-plugins/issues/634)) ([b94c4dc](https://github.com/janus-idp/backstage-plugins/commit/b94c4dc50ada328e5ce1bed5fb7c76f64607e1ee))

### Dependencies

- **@janus-idp/shared-react:** upgraded to 1.3.0

## @janus-idp/backstage-plugin-topology [1.14.3](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.14.2...@janus-idp/backstage-plugin-topology@1.14.3) (2023-08-14)

### Dependencies

- **@janus-idp/shared-react:** upgraded to 1.2.2

## @janus-idp/backstage-plugin-topology [1.14.2](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.14.1...@janus-idp/backstage-plugin-topology@1.14.2) (2023-08-14)

### Dependencies

- **@janus-idp/shared-react:** upgraded to 1.2.1

## @janus-idp/backstage-plugin-topology [1.14.1](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.14.0...@janus-idp/backstage-plugin-topology@1.14.1) (2023-08-11)

### Dependencies

- **@janus-idp/shared-react:** upgraded to 1.2.0

## @janus-idp/backstage-plugin-topology [1.14.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.13.3...@janus-idp/backstage-plugin-topology@1.14.0) (2023-08-11)

### Features

- **topology:** add runtime icon to topology node ([#615](https://github.com/janus-idp/backstage-plugins/issues/615)) ([dc3769b](https://github.com/janus-idp/backstage-plugins/commit/dc3769b9e88ac2187c38ae29ab0863f5a8463621))

## @janus-idp/backstage-plugin-topology [1.13.3](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.13.2...@janus-idp/backstage-plugin-topology@1.13.3) (2023-08-10)

### Bug Fixes

- **topology:** fix pod status info in topology side panel ([#620](https://github.com/janus-idp/backstage-plugins/issues/620)) ([c4c428c](https://github.com/janus-idp/backstage-plugins/commit/c4c428c44d9fec1fdfb5fe1dd5205c3abc6b5cd1))

## @janus-idp/backstage-plugin-topology [1.13.2](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.13.1...@janus-idp/backstage-plugin-topology@1.13.2) (2023-08-10)

## @janus-idp/backstage-plugin-topology [1.13.1](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.13.0...@janus-idp/backstage-plugin-topology@1.13.1) (2023-08-10)

### Dependencies

- **@janus-idp/shared-react:** upgraded to 1.1.1

## @janus-idp/backstage-plugin-topology [1.13.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.12.0...@janus-idp/backstage-plugin-topology@1.13.0) (2023-08-09)

### Features

- **topology:** add download pod logs functionality ([#616](https://github.com/janus-idp/backstage-plugins/issues/616)) ([63ae6f4](https://github.com/janus-idp/backstage-plugins/commit/63ae6f495d8c4739082ffae188094a8321ef7496))

## @janus-idp/backstage-plugin-topology [1.12.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.11.0...@janus-idp/backstage-plugin-topology@1.12.0) (2023-08-08)

### Features

- **topology:** show only latest 3 pods/plrs in node sidebar ([#577](https://github.com/janus-idp/backstage-plugins/issues/577)) ([2a56f8e](https://github.com/janus-idp/backstage-plugins/commit/2a56f8e98f615201cb95fa8f6ccf1724d6e5778c))

## @janus-idp/backstage-plugin-topology [1.11.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.10.0...@janus-idp/backstage-plugin-topology@1.11.0) (2023-07-26)

### Features

- **topology:** add edit code node decorator ([#535](https://github.com/janus-idp/backstage-plugins/issues/535)) ([8b5893a](https://github.com/janus-idp/backstage-plugins/commit/8b5893a62a2b23274666d5a7f26ad6e3978741b1))

## @janus-idp/backstage-plugin-topology [1.10.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.9.0...@janus-idp/backstage-plugin-topology@1.10.0) (2023-07-25)

### Features

- **shared-react:** update shared plugin ([#532](https://github.com/janus-idp/backstage-plugins/issues/532)) ([88ec74e](https://github.com/janus-idp/backstage-plugins/commit/88ec74e704c185785329d12f129bd8e1590ac1c8))
- **topology:** show pipeline decorator on topology node ([#447](https://github.com/janus-idp/backstage-plugins/issues/447)) ([f983c47](https://github.com/janus-idp/backstage-plugins/commit/f983c47d8d82433fe188c59d8d1569c1be30a7db))

### Bug Fixes

- **topology:** fix topology node tooltip position ([#538](https://github.com/janus-idp/backstage-plugins/issues/538)) ([07e9086](https://github.com/janus-idp/backstage-plugins/commit/07e90862ac8d5dc58e4730fbadc57109071c35c5))

### Dependencies

- **@janus-idp/shared-react:** upgraded to 1.1.0

## @janus-idp/backstage-plugin-topology [1.9.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.8.0...@janus-idp/backstage-plugin-topology@1.9.0) (2023-06-30)

### Features

- **topology:** support for logviewer for pods based on container ([#464](https://github.com/janus-idp/backstage-plugins/issues/464)) ([cf2af63](https://github.com/janus-idp/backstage-plugins/commit/cf2af637b2e98e0e0e8d9c16ce40bb04021d4a91))

## @janus-idp/backstage-plugin-topology [1.8.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.7.2...@janus-idp/backstage-plugin-topology@1.8.0) (2023-06-26)

### Features

- **topology:** show pipeline-runs list in sidepanel ([#403](https://github.com/janus-idp/backstage-plugins/issues/403)) ([b0d805a](https://github.com/janus-idp/backstage-plugins/commit/b0d805a259c03316eb94a80a42a57b93a97b4083))

## @janus-idp/backstage-plugin-topology [1.7.2](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.7.1...@janus-idp/backstage-plugin-topology@1.7.2) (2023-06-21)

### Documentation

- **topology:** fixes to topology readme ([#468](https://github.com/janus-idp/backstage-plugins/issues/468)) ([b94f1ae](https://github.com/janus-idp/backstage-plugins/commit/b94f1ae0b241636ab9a6b74c063a4e31dc8016ed))

## @janus-idp/backstage-plugin-topology [1.7.1](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.7.0...@janus-idp/backstage-plugin-topology@1.7.1) (2023-06-14)

### Other changes

- reorder imports via prettier ([#419](https://github.com/janus-idp/backstage-plugins/issues/419)) ([17f1e6a](https://github.com/janus-idp/backstage-plugins/commit/17f1e6a689bd793a619ec5e42e5cdda0998f78a5))

### Documentation

- update plugin README formatting ([#396](https://github.com/janus-idp/backstage-plugins/issues/396)) ([9b39056](https://github.com/janus-idp/backstage-plugins/commit/9b39056f6c66e9a6a0a5d0c4059420dff66db263)), closes [#295](https://github.com/janus-idp/backstage-plugins/issues/295) [#369](https://github.com/janus-idp/backstage-plugins/issues/369) [#295](https://github.com/janus-idp/backstage-plugins/issues/295) [#369](https://github.com/janus-idp/backstage-plugins/issues/369)

## @janus-idp/backstage-plugin-topology [1.7.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.6.3...@janus-idp/backstage-plugin-topology@1.7.0) (2023-05-31)

### Features

- **topology:** visualize Route resource in decorator and sidebar for supported workloads ([#378](https://github.com/janus-idp/backstage-plugins/issues/378)) ([1a489b3](https://github.com/janus-idp/backstage-plugins/commit/1a489b328a10f79fc136ff47a55d9081a4f2856d))

## @janus-idp/backstage-plugin-topology [1.6.3](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.6.2...@janus-idp/backstage-plugin-topology@1.6.3) (2023-05-30)

## @janus-idp/backstage-plugin-topology [1.6.2](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.6.1...@janus-idp/backstage-plugin-topology@1.6.2) (2023-05-30)

## @janus-idp/backstage-plugin-topology [1.6.1](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.6.0...@janus-idp/backstage-plugin-topology@1.6.1) (2023-05-30)

### Bug Fixes

- **topology:** close workload sidepanel on outside-click ([#399](https://github.com/janus-idp/backstage-plugins/issues/399)) ([e870b6f](https://github.com/janus-idp/backstage-plugins/commit/e870b6f1bdca7b1fd9823560bb5f66ffbaff0033))

## @janus-idp/backstage-plugin-topology [1.6.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.5.11...@janus-idp/backstage-plugin-topology@1.6.0) (2023-05-26)

### Features

- **topology:** add specific details for all supported workloads ([#295](https://github.com/janus-idp/backstage-plugins/issues/295)) ([788c23a](https://github.com/janus-idp/backstage-plugins/commit/788c23a09ba3402e2f8b582a0b7bff635c412687))

### Bug Fixes

- **topology:** persist selected topology node id in new tab ([#369](https://github.com/janus-idp/backstage-plugins/issues/369)) ([28e6d82](https://github.com/janus-idp/backstage-plugins/commit/28e6d825508d33f18bbfa17b8c5e0e222328700c))

## @janus-idp/backstage-plugin-topology [1.5.11](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.5.10...@janus-idp/backstage-plugin-topology@1.5.11) (2023-05-22)

### Documentation

- **Topology:** updates user docs ([#381](https://github.com/janus-idp/backstage-plugins/issues/381)) ([417964a](https://github.com/janus-idp/backstage-plugins/commit/417964a65ad65dfdef4d705a7fa598574e1409fd))

## @janus-idp/backstage-plugin-topology [1.5.10](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.5.9...@janus-idp/backstage-plugin-topology@1.5.10) (2023-05-18)

### Documentation

- update plugin READMEs ([#373](https://github.com/janus-idp/backstage-plugins/issues/373)) ([478560e](https://github.com/janus-idp/backstage-plugins/commit/478560e38cceaa40d976bccf4785956ed58b5221))

## @janus-idp/backstage-plugin-topology [1.5.9](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.5.8...@janus-idp/backstage-plugin-topology@1.5.9) (2023-05-17)

### Bug Fixes

- **deps:** update all non-major dependencies ([#358](https://github.com/janus-idp/backstage-plugins/issues/358)) ([086a9ed](https://github.com/janus-idp/backstage-plugins/commit/086a9ed839f3a6dd1460f0f87b71453a7ed62ea3))

## @janus-idp/backstage-plugin-topology [1.5.8](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.5.7...@janus-idp/backstage-plugin-topology@1.5.8) (2023-05-15)

## @janus-idp/backstage-plugin-topology [1.5.7](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.5.6...@janus-idp/backstage-plugin-topology@1.5.7) (2023-05-15)

## @janus-idp/backstage-plugin-topology [1.5.6](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.5.5...@janus-idp/backstage-plugin-topology@1.5.6) (2023-05-11)

### Bug Fixes

- **deps:** update all non-major dependencies ([#339](https://github.com/janus-idp/backstage-plugins/issues/339)) ([d19d96d](https://github.com/janus-idp/backstage-plugins/commit/d19d96de7b55c205e0f77528e476104c0685aad2))

## @janus-idp/backstage-plugin-topology [1.5.5](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.5.4...@janus-idp/backstage-plugin-topology@1.5.5) (2023-05-09)

### Bug Fixes

- **plugins:** remove React.FC types ([#335](https://github.com/janus-idp/backstage-plugins/issues/335)) ([f3d40af](https://github.com/janus-idp/backstage-plugins/commit/f3d40af9c6e55e5699ed78d07ae6617e25b33c18))

### Other changes

- **deps:** update all non-major dependencies ([#333](https://github.com/janus-idp/backstage-plugins/issues/333)) ([dce0ea4](https://github.com/janus-idp/backstage-plugins/commit/dce0ea4a9b9f517bd864d39f0b364c68e6a2e143))
- **plugins:** remove react namespace import ([#336](https://github.com/janus-idp/backstage-plugins/issues/336)) ([01ab4aa](https://github.com/janus-idp/backstage-plugins/commit/01ab4aaf9c88c58c955903372b556f33e2e6461e))

## @janus-idp/backstage-plugin-topology [1.5.4](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.5.3...@janus-idp/backstage-plugin-topology@1.5.4) (2023-05-08)

### Documentation

- review for Topology plugin ([#269](https://github.com/janus-idp/backstage-plugins/issues/269)) ([10f0910](https://github.com/janus-idp/backstage-plugins/commit/10f0910ddab0b826b7d968bd569ab0442caef1ed))

## @janus-idp/backstage-plugin-topology [1.5.3](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.5.2...@janus-idp/backstage-plugin-topology@1.5.3) (2023-05-05)

### Bug Fixes

- **topology:** adds wrapper to topology view for consistent border ([#326](https://github.com/janus-idp/backstage-plugins/issues/326)) ([51a5a0d](https://github.com/janus-idp/backstage-plugins/commit/51a5a0dc2216517785e1ef0cf397bc05cd8a6a98))

## @janus-idp/backstage-plugin-topology [1.5.2](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.5.1...@janus-idp/backstage-plugin-topology@1.5.2) (2023-05-04)

### Other changes

- **deps:** update all non-major dependencies ([#127](https://github.com/janus-idp/backstage-plugins/issues/127)) ([a9d359f](https://github.com/janus-idp/backstage-plugins/commit/a9d359f01448d1b9b4b4d3d9b087052fb6ff16b3))

## @janus-idp/backstage-plugin-topology [1.5.1](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.5.0...@janus-idp/backstage-plugin-topology@1.5.1) (2023-05-04)

### Bug Fixes

- **topology:** Fix topology sidepanel css ([#289](https://github.com/janus-idp/backstage-plugins/issues/289)) ([37c6d2e](https://github.com/janus-idp/backstage-plugins/commit/37c6d2e89b744c2435bde8c6f58cb7b03e5f8e84))

## @janus-idp/backstage-plugin-topology [1.5.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.4.2...@janus-idp/backstage-plugin-topology@1.5.0) (2023-04-18)

### Features

- **topology:** Show ingress rules in sidebar ([#256](https://github.com/janus-idp/backstage-plugins/issues/256)) ([22a565c](https://github.com/janus-idp/backstage-plugins/commit/22a565cea15b0b222cf246189b4e04621ea275f3))

## @janus-idp/backstage-plugin-topology [1.4.2](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.4.1...@janus-idp/backstage-plugin-topology@1.4.2) (2023-04-18)

### Bug Fixes

- **topology:** updates pf react-topology to standalone release ([#261](https://github.com/janus-idp/backstage-plugins/issues/261)) ([90c78e9](https://github.com/janus-idp/backstage-plugins/commit/90c78e9abdad6f72cd9fad7e41736bbe6324c203))

## @janus-idp/backstage-plugin-topology [1.4.1](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.4.0...@janus-idp/backstage-plugin-topology@1.4.1) (2023-04-18)

### Bug Fixes

- **topology:** Get selected-node if data-model available ([#258](https://github.com/janus-idp/backstage-plugins/issues/258)) ([d54b798](https://github.com/janus-idp/backstage-plugins/commit/d54b7985640262ac2603a09b1b42dbf406f05287))

## @janus-idp/backstage-plugin-topology [1.4.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.3.1...@janus-idp/backstage-plugin-topology@1.4.0) (2023-04-17)

### Features

- **topology:** Add topology workload node sidebar ([#226](https://github.com/janus-idp/backstage-plugins/issues/226)) ([9b87752](https://github.com/janus-idp/backstage-plugins/commit/9b877524475b65ff6095a2203e5c9da7e7a7f666))

## @janus-idp/backstage-plugin-topology [1.3.1](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.3.0...@janus-idp/backstage-plugin-topology@1.3.1) (2023-04-14)

### Bug Fixes

- **topology:** moves base styles to plugin form component ([#252](https://github.com/janus-idp/backstage-plugins/issues/252)) ([860ee5e](https://github.com/janus-idp/backstage-plugins/commit/860ee5e684f2483c9b22e8bdc1633edb1742c154))

## @janus-idp/backstage-plugin-topology [1.3.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.2.5...@janus-idp/backstage-plugin-topology@1.3.0) (2023-04-06)

### Features

- **topology:** added visualization of SS, DS, CJ and Jobs in the topology view ([#193](https://github.com/janus-idp/backstage-plugins/issues/193)) ([badb026](https://github.com/janus-idp/backstage-plugins/commit/badb0269de9f1886da783b0aa5daeafab9b2318c))

## @janus-idp/backstage-plugin-topology [1.2.5](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.2.4...@janus-idp/backstage-plugin-topology@1.2.5) (2023-03-24)

### Bug Fixes

- **topology:** Change toolbar text and spacing ([#202](https://github.com/janus-idp/backstage-plugins/issues/202)) ([d2fc80c](https://github.com/janus-idp/backstage-plugins/commit/d2fc80c6b577474864d694f51c14561fc4a2ae40))

## @janus-idp/backstage-plugin-topology [1.2.4](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.2.3...@janus-idp/backstage-plugin-topology@1.2.4) (2023-03-23)

### Bug Fixes

- **topology:** updates PF versions ([#195](https://github.com/janus-idp/backstage-plugins/issues/195)) ([67e136e](https://github.com/janus-idp/backstage-plugins/commit/67e136e4ded19feb754a0bbc45776e95fa0e2498))

## @janus-idp/backstage-plugin-topology [1.2.3](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.2.2...@janus-idp/backstage-plugin-topology@1.2.3) (2023-03-22)

### Bug Fixes

- **topology:** removed mobx and mobx-react from direct dependency and use one from @patternfly/react-topology ([#188](https://github.com/janus-idp/backstage-plugins/issues/188)) ([fe6f935](https://github.com/janus-idp/backstage-plugins/commit/fe6f9352789f3d243f5da1d7e3469298321fd5d4))

## @janus-idp/backstage-plugin-topology [1.2.2](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.2.1...@janus-idp/backstage-plugin-topology@1.2.2) (2023-03-21)

### Bug Fixes

- **deps:** update dependency mobx-react to v7 ([#154](https://github.com/janus-idp/backstage-plugins/issues/154)) ([51eb0cb](https://github.com/janus-idp/backstage-plugins/commit/51eb0cbd06ba6bc2a1d8a45d8049c405151501b0))

## @janus-idp/backstage-plugin-topology [1.2.1](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.2.0...@janus-idp/backstage-plugin-topology@1.2.1) (2023-03-21)

### Bug Fixes

- **deps:** update dependency mobx to v6 ([#153](https://github.com/janus-idp/backstage-plugins/issues/153)) ([33ba4a8](https://github.com/janus-idp/backstage-plugins/commit/33ba4a87b250d8bd209e9465d8c0bcd814f85cd3))

# @janus-idp/backstage-plugin-topology [1.2.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.1.0...@janus-idp/backstage-plugin-topology@1.2.0) (2023-03-20)

### Features

- **topology:** Add filter resources by cluster functionality in Topology plugin ([#146](https://github.com/janus-idp/backstage-plugins/issues/146)) ([811f72f](https://github.com/janus-idp/backstage-plugins/commit/811f72f1425962753a74310117b752991eb49360))

# @janus-idp/backstage-plugin-topology [1.1.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.0.3...@janus-idp/backstage-plugin-topology@1.1.0) (2023-03-17)

### Features

- **topology:** adds support for decorator in topology for ingress ([#148](https://github.com/janus-idp/backstage-plugins/issues/148)) ([05d17c2](https://github.com/janus-idp/backstage-plugins/commit/05d17c2cd004ab467b18f460ce70ae30898f093e))

## @janus-idp/backstage-plugin-topology [1.0.3](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.0.2...@janus-idp/backstage-plugin-topology@1.0.3) (2023-03-10)

### Bug Fixes

- **topology:** getDeploymentRevision always return false but not the revision for deployment ([72f5c7a](https://github.com/janus-idp/backstage-plugins/commit/72f5c7a2e2a0e9d4d0fabf624d8cb55f9a2d222b))

## @janus-idp/backstage-plugin-topology [1.0.2](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.0.1...@janus-idp/backstage-plugin-topology@1.0.2) (2023-03-06)

### Bug Fixes

- **metadata:** adding default metadata to current plugins ([06776da](https://github.com/janus-idp/backstage-plugins/commit/06776dafdbab6d4fa85b92d5b676f65d97bbdb44)), closes [#155](https://github.com/janus-idp/backstage-plugins/issues/155) [#155](https://github.com/janus-idp/backstage-plugins/issues/155)

## @janus-idp/backstage-plugin-topology [1.0.1](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-topology@1.0.0...@janus-idp/backstage-plugin-topology@1.0.1) (2023-03-02)

### Bug Fixes

- **topology:** fixes pods label overlap with rolling recreate ([35cbaac](https://github.com/janus-idp/backstage-plugins/commit/35cbaac87b938214dbc43dc9df5e889db727136a))

# @janus-idp/backstage-plugin-topology 1.0.0 (2023-02-28)

### Features

- **topology:** Initial release ([66889b7](https://github.com/janus-idp/backstage-plugins/commit/66889b79933bb3e7f491bbc4b6d6cadf9f965999))
