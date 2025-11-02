### Dependencies

## 1.20.0

### Minor Changes

- 1e3b40b: Backstage version bump to v1.44.0

## 1.19.1

### Patch Changes

- 9f1486f: Updated dependency `@testing-library/jest-dom` to `6.9.1`.

## 1.19.0

### Minor Changes

- 2258b1a: Backstage version bump to v1.43.2

### Patch Changes

- eac91f6: Added support for Backstage's New Frontend System.

  If you're migrating to the new frontend system, you no longer need to wire up an API implementation in `apis.ts`. Instead, pass the module in to the `createApp()` function:

  ```tsx
  import matomoModule from '@backstage-community/plugin-analytics-module-matomo/alpha';

  const app = createApp({
    features: [matomoModule],
  });
  ```

  This can be skipped if you have feature discovery enabled.

## 1.18.1

### Patch Changes

- 4819a06: Updated dependency `@testing-library/jest-dom` to `6.8.0`.

## 1.18.0

### Minor Changes

- 3d6351f: Backstage version bump to v1.42.4

## 1.17.1

### Patch Changes

- 4523634: Updated dependency `@testing-library/jest-dom` to `6.7.0`.

## 1.17.0

### Minor Changes

- b5a8ecf: Added `sendPlainUserId` config, which controls whether hashing of userId should be disabled.
- 70f97c5: Backstage version bump to v1.40.2

### Patch Changes

- 0775db8: remove devDependency on '@redhat-developer/red-hat-developer-hub-theme'
- 6877ddc: Updated dependency `@testing-library/jest-dom` to `6.6.4`.

## 1.16.0

### Minor Changes

- 4ed9028: Backstage version bump to v1.39.0

### Patch Changes

- 6a59fcf: remove support and lifecycle keywords in package.json
- e958f2f: Updated dependency `@types/node` to `22.15.29`.

## 1.15.0

### Minor Changes

- 8b665f9: Backstage version bump to v1.38.1

### Patch Changes

- df57926: Updated dependency `@types/node` to `18.19.103`.
- 66db576: Updated dependency `@types/node` to `18.19.100`.
- 66db576: Updated dependency `@types/node` to `18.19.100`.

## 1.14.0

### Minor Changes

- 9fe29e9: Backstage version bump to v1.37.0

## 1.13.1

### Patch Changes

- 973a5ef: remove prettier from devDependencies

## 1.13.0

### Minor Changes

- 926f672: Backstage version bump to v1.36.1

## 1.12.0

### Minor Changes

- 2e3d4af: Configurable user tracking for Matomo

## 1.11.0

### Minor Changes

- b56df3f: Backstage version bump to v1.35.1

## 1.10.0

### Minor Changes

- ac6e8f9: Backstage version bump to v1.34.1

### Patch Changes

- 350250c: Updated dependency `@testing-library/jest-dom` to `6.6.3`.
- 0f5c451: Updated dependency `prettier` to `3.4.2`.
- 18f9d9d: Updated dependency `@types/node` to `18.19.68`.

## 1.9.1

### Patch Changes

- a6e850f: Updated dependency `msw` to `1.3.5`.

## 1.9.0

### Minor Changes

- 883e289: Migrate matomo analytics provider from janus to backstage community-plugins.

## 1.8.1

### Patch Changes

- 0e6bfd3: feat: update Backstage to the latest version

  Update to Backstage 1.32.5

## 1.8.0

### Minor Changes

- 8244f28: chore(deps): update to backstage 1.32

## 1.7.1

### Patch Changes

- 7342e9b: chore: remove @janus-idp/cli dep and relink local packages

  This update removes `@janus-idp/cli` from all plugins, as it’s no longer necessary. Additionally, packages are now correctly linked with a specified version.

## 1.7.0

### Minor Changes

- d9551ae: feat(deps): update to backstage 1.31

### Patch Changes

- d9551ae: Change local package references to a `*`
- d9551ae: pin the @janus-idp/cli package
- d9551ae: upgrade to yarn v3

* **@janus-idp/cli:** upgraded to 1.15.2

### Dependencies

- **@janus-idp/cli:** upgraded to 1.15.1

### Dependencies

- **@janus-idp/cli:** upgraded to 1.15.0

### Dependencies

- **@janus-idp/cli:** upgraded to 1.14.0

### Dependencies

- **@janus-idp/cli:** upgraded to 1.13.2

### Dependencies

- **@janus-idp/cli:** upgraded to 1.13.1

## @janus-idp/backstage-plugin-analytics-module-matomo [1.5.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-module-matomo@1.4.0...@janus-idp/backstage-plugin-analytics-module-matomo@1.5.0) (2024-07-25)

### Features

- **deps:** update to backstage 1.29 ([#1900](https://github.com/janus-idp/backstage-plugins/issues/1900)) ([f53677f](https://github.com/janus-idp/backstage-plugins/commit/f53677fb02d6df43a9de98c43a9f101a6db76802))

### Dependencies

- **@janus-idp/cli:** upgraded to 1.13.0

## @janus-idp/backstage-plugin-analytics-module-matomo [1.4.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-module-matomo@1.3.1...@janus-idp/backstage-plugin-analytics-module-matomo@1.4.0) (2024-07-23)

### Features

- **deps:** update to backstage 1.28 ([#1891](https://github.com/janus-idp/backstage-plugins/issues/1891)) ([1ba1108](https://github.com/janus-idp/backstage-plugins/commit/1ba11088e0de60e90d138944267b83600dc446e5))

## @janus-idp/backstage-plugin-analytics-module-matomo [1.3.1](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-module-matomo@1.3.0...@janus-idp/backstage-plugin-analytics-module-matomo@1.3.1) (2024-06-19)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.11.1

## @janus-idp/backstage-plugin-analytics-module-matomo [1.3.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-module-matomo@1.2.11...@janus-idp/backstage-plugin-analytics-module-matomo@1.3.0) (2024-06-13)

### Features

- **deps:** update to backstage 1.27 ([#1683](https://github.com/janus-idp/backstage-plugins/issues/1683)) ([a14869c](https://github.com/janus-idp/backstage-plugins/commit/a14869c3f4177049cb8d6552b36c3ffd17e7997d))

### Dependencies

- **@janus-idp/cli:** upgraded to 1.11.0

## @janus-idp/backstage-plugin-analytics-module-matomo [1.2.11](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-module-matomo@1.2.10...@janus-idp/backstage-plugin-analytics-module-matomo@1.2.11) (2024-06-13)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.10.1

## @janus-idp/backstage-plugin-analytics-module-matomo [1.2.10](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-module-matomo@1.2.9...@janus-idp/backstage-plugin-analytics-module-matomo@1.2.10) (2024-06-05)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.10.0

## @janus-idp/backstage-plugin-analytics-module-matomo [1.2.9](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-module-matomo@1.2.8...@janus-idp/backstage-plugin-analytics-module-matomo@1.2.9) (2024-06-04)

## @janus-idp/backstage-plugin-analytics-module-matomo [1.2.8](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-module-matomo@1.2.7...@janus-idp/backstage-plugin-analytics-module-matomo@1.2.8) (2024-06-04)

## @janus-idp/backstage-plugin-analytics-module-matomo [1.2.7](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-module-matomo@1.2.6...@janus-idp/backstage-plugin-analytics-module-matomo@1.2.7) (2024-06-03)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.9.0

## @janus-idp/backstage-plugin-analytics-module-matomo [1.2.6](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-module-matomo@1.2.5...@janus-idp/backstage-plugin-analytics-module-matomo@1.2.6) (2024-05-31)

## @janus-idp/backstage-plugin-analytics-module-matomo [1.2.5](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-module-matomo@1.2.4...@janus-idp/backstage-plugin-analytics-module-matomo@1.2.5) (2024-05-29)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.8.10

## @janus-idp/backstage-plugin-analytics-module-matomo [1.2.4](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-module-matomo@1.2.3...@janus-idp/backstage-plugin-analytics-module-matomo@1.2.4) (2024-05-29)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.8.9

## @janus-idp/backstage-plugin-analytics-module-matomo [1.2.3](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-module-matomo@1.2.2...@janus-idp/backstage-plugin-analytics-module-matomo@1.2.3) (2024-05-28)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.8.8

## @janus-idp/backstage-plugin-analytics-module-matomo [1.2.2](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-module-matomo@1.2.1...@janus-idp/backstage-plugin-analytics-module-matomo@1.2.2) (2024-05-16)

## @janus-idp/backstage-plugin-analytics-module-matomo [1.2.1](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-module-matomo@1.2.0...@janus-idp/backstage-plugin-analytics-module-matomo@1.2.1) (2024-05-16)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.8.7

## @janus-idp/backstage-plugin-analytics-module-matomo [1.2.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-module-matomo@1.1.13...@janus-idp/backstage-plugin-analytics-module-matomo@1.2.0) (2024-05-14)

### Features

- **deps:** use RHDH themes in the backstage app and dev pages ([#1480](https://github.com/janus-idp/backstage-plugins/issues/1480)) ([8263bf0](https://github.com/janus-idp/backstage-plugins/commit/8263bf099736cbb0d0f2316082d338ba81fa6927))

## @janus-idp/backstage-plugin-analytics-module-matomo [1.1.13](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-module-matomo@1.1.12...@janus-idp/backstage-plugin-analytics-module-matomo@1.1.13) (2024-05-09)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.8.6

## @janus-idp/backstage-plugin-analytics-module-matomo [1.1.12](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-module-matomo@1.1.11...@janus-idp/backstage-plugin-analytics-module-matomo@1.1.12) (2024-05-02)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.8.5

## @janus-idp/backstage-plugin-analytics-module-matomo [1.1.11](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-module-matomo@1.1.10...@janus-idp/backstage-plugin-analytics-module-matomo@1.1.11) (2024-05-02)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.8.4

## @janus-idp/backstage-plugin-analytics-module-matomo [1.1.10](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-module-matomo@1.1.9...@janus-idp/backstage-plugin-analytics-module-matomo@1.1.10) (2024-04-30)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.8.3

## @janus-idp/backstage-plugin-analytics-module-matomo [1.1.9](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-module-matomo@1.1.8...@janus-idp/backstage-plugin-analytics-module-matomo@1.1.9) (2024-04-30)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.8.2

## @janus-idp/backstage-plugin-analytics-module-matomo [1.1.8](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-module-matomo@1.1.7...@janus-idp/backstage-plugin-analytics-module-matomo@1.1.8) (2024-04-25)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.8.1

## @janus-idp/backstage-plugin-analytics-module-matomo [1.1.7](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-module-matomo@1.1.6...@janus-idp/backstage-plugin-analytics-module-matomo@1.1.7) (2024-04-15)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.8.0

## @janus-idp/backstage-plugin-analytics-module-matomo [1.1.6](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-module-matomo@1.1.5...@janus-idp/backstage-plugin-analytics-module-matomo@1.1.6) (2024-04-09)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.7.10

## @janus-idp/backstage-plugin-analytics-module-matomo [1.1.5](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-module-matomo@1.1.4...@janus-idp/backstage-plugin-analytics-module-matomo@1.1.5) (2024-04-09)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.7.9

## @janus-idp/backstage-plugin-analytics-module-matomo [1.1.4](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-module-matomo@1.1.3...@janus-idp/backstage-plugin-analytics-module-matomo@1.1.4) (2024-04-05)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.7.8

## @janus-idp/backstage-plugin-analytics-module-matomo [1.1.3](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-module-matomo@1.1.2...@janus-idp/backstage-plugin-analytics-module-matomo@1.1.3) (2024-04-02)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.7.7

## @janus-idp/backstage-plugin-analytics-module-matomo [1.1.2](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-module-matomo@1.1.1...@janus-idp/backstage-plugin-analytics-module-matomo@1.1.2) (2024-03-29)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.7.6

## @janus-idp/backstage-plugin-analytics-module-matomo [1.1.1](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-module-matomo@1.1.0...@janus-idp/backstage-plugin-analytics-module-matomo@1.1.1) (2024-03-15)

### Bug Fixes

- **matomo-analytics:** event trigger on load ([#1341](https://github.com/janus-idp/backstage-plugins/issues/1341)) ([3bc11f3](https://github.com/janus-idp/backstage-plugins/commit/3bc11f318d012d7a2aa43b4928891c138ee2a5d9))

## @janus-idp/backstage-plugin-analytics-module-matomo [1.1.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-module-matomo@1.0.4...@janus-idp/backstage-plugin-analytics-module-matomo@1.1.0) (2024-03-15)

### Features

- **matomo-analytics:** export apifactory for dynamic plugin ([#1329](https://github.com/janus-idp/backstage-plugins/issues/1329)) ([c687617](https://github.com/janus-idp/backstage-plugins/commit/c6876177f062878801e798ea0193126a28f9fa08))

## @janus-idp/backstage-plugin-analytics-module-matomo [1.0.4](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-module-matomo@1.0.3...@janus-idp/backstage-plugin-analytics-module-matomo@1.0.4) (2024-02-22)

### Documentation

- **matomo-plugin:** fix config example and replace GA with Matomo ([#991](https://github.com/janus-idp/backstage-plugins/issues/991)) ([55d6048](https://github.com/janus-idp/backstage-plugins/commit/55d6048c3490dfc6db9a3ebc4103ed505eeaaaf4))

## @janus-idp/backstage-plugin-analytics-module-matomo [1.0.3](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-module-matomo@1.0.2...@janus-idp/backstage-plugin-analytics-module-matomo@1.0.3) (2024-02-21)

## @janus-idp/backstage-plugin-analytics-module-matomo 1.0.0 (2023-10-30)

### Features

- **matomo:** analytics module plugin for matomo ([#837](https://github.com/janus-idp/backstage-plugins/issues/837)) ([8c497fc](https://github.com/janus-idp/backstage-plugins/commit/8c497fcd588c492f4d21bb686bcdd796691f0c90))

## @janus-idp/backstage-plugin-analytics-module-matomo [1.0.2](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-module-matomo@1.0.1...@janus-idp/backstage-plugin-analytics-module-matomo@1.0.2) (2023-10-19)

## @janus-idp/backstage-plugin-analytics-module-matomo [1.0.1](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-module-matomo@1.0.0...@janus-idp/backstage-plugin-analytics-module-matomo@1.0.1) (2023-10-19)

## @janus-idp/backstage-plugin-analytics-module-matomo 1.0.0 (2023-10-17)

### Features

- **matomo:** analytics module plugin for matomo ([#837](https://github.com/janus-idp/backstage-plugins/issues/837)) ([8c497fc](https://github.com/janus-idp/backstage-plugins/commit/8c497fcd588c492f4d21bb686bcdd796691f0c90))
