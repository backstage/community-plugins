### Dependencies

## 1.21.0

### Minor Changes

- 1e3b40b: Backstage version bump to v1.44.0

## 1.20.1

### Patch Changes

- 469f51c: Updated dependency `@types/react` to `18.3.26`.
- 9f1486f: Updated dependency `@testing-library/jest-dom` to `6.9.1`.

## 1.20.0

### Minor Changes

- 2258b1a: Backstage version bump to v1.43.2

### Patch Changes

- 13b3e1f: Added support for Backstage's New Frontend System.

  If you're migrating to the new frontend system, you no longer need to wire up an API implementation in `apis.ts`. Instead, pass the plugin in to the `createApp()` function:

  ```tsx
  import analyticsProviderSegmentPlugin from '@backstage-community/plugin-analytics-provider-segment/alpha';

  const app = createApp({
    features: [analyticsProviderSegmentPlugin],
  });
  ```

  This can be skipped if you have feature discovery enabled.

## 1.19.1

### Patch Changes

- 4819a06: Updated dependency `@testing-library/jest-dom` to `6.8.0`.

## 1.19.0

### Minor Changes

- 3d6351f: Backstage version bump to v1.42.4

## 1.18.0

### Minor Changes

- d03671a: - Added support for App version and Backstage version tracking in analytics events
  - New configuration options: `appVersion` and `backstageVersion` for enhanced analytics segmentation

### Patch Changes

- 1171227: Updated dependency `@types/react` to `18.3.24`.
- 4523634: Updated dependency `@testing-library/jest-dom` to `6.7.0`.

## 1.17.0

### Minor Changes

- 70f97c5: Backstage version bump to v1.40.2

### Patch Changes

- 0775db8: remove devDependency on '@redhat-developer/red-hat-developer-hub-theme'
- 6877ddc: Updated dependency `@testing-library/jest-dom` to `6.6.4`.

## 1.16.0

### Minor Changes

- e86934c: Updated the SegmentAnalytics class .fromConfig signature to better conform with Backstage recommended API
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
- 9d260e1: Updated dependency `@types/react` to `18.3.23`.

## 1.14.4

### Patch Changes

- ac0349f: Updated dependency `@types/react` to `18.3.20`.

## 1.14.3

### Patch Changes

- 2469b23: Remove @spotify/prettier-config from devDependencies.

## 1.14.2

### Patch Changes

- f84ad73: chore: remove homepage field from package.json

## 1.14.1

### Patch Changes

- 40bfd38: Updated dependency `@types/react` to `18.3.19`.

## 1.14.0

### Minor Changes

- 9fe29e9: Backstage version bump to v1.37.0

## 1.13.1

### Patch Changes

- 973a5ef: remove prettier from devDependencies
- 32135b8: Updated dependency `@testing-library/user-event` to `14.6.1`.

## 1.13.0

### Minor Changes

- 926f672: Backstage version bump to v1.36.1

## 1.12.1

### Patch Changes

- 5a38af3: Updated dependency `@types/react` to `18.3.18`.

## 1.12.0

### Minor Changes

- b56df3f: Backstage version bump to v1.35.1

## 1.11.0

### Minor Changes

- ac6e8f9: Backstage version bump to v1.34.1

### Patch Changes

- 350250c: Updated dependency `@testing-library/jest-dom` to `6.6.3`.
- 0f5c451: Updated dependency `prettier` to `3.4.2`.
- 7fb84ca: Updated dependency `@types/react` to `18.3.17`.
- 18f9d9d: Updated dependency `@types/node` to `18.19.68`.

## 1.10.4

### Patch Changes

- dd8f9e4: Updated dependency `@types/react` to `18.3.12`.

## 1.10.3

### Patch Changes

- a6e850f: Updated dependency `msw` to `1.3.5`.

## 1.10.2

### Patch Changes

- 059ecb2: The `analytics-provider-segment` plugin from the [janus-idp/backstage-plugins](https://github.com/janus-idp/backstage-plugins) repository was migrated to the community plugins. The migration was performed by following the manual migration steps outlined in the [Community Plugins CONTRIBUTING guide](https://github.com/backstage/community-plugins/blob/main/CONTRIBUTING.md#migrating-a-plugin)

## 1.10.1

### Patch Changes

- 0e6bfd3: feat: update Backstage to the latest version

  Update to Backstage 1.32.5

## 1.10.0

### Minor Changes

- 8244f28: chore(deps): update to backstage 1.32

## 1.9.1

### Patch Changes

- 7342e9b: chore: remove @janus-idp/cli dep and relink local packages

  This update removes `@janus-idp/cli` from all plugins, as it’s no longer necessary. Additionally, packages are now correctly linked with a specified version.

## 1.9.0

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

## @janus-idp/backstage-plugin-analytics-provider-segment [1.7.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-provider-segment@1.6.0...@janus-idp/backstage-plugin-analytics-provider-segment@1.7.0) (2024-07-25)

### Features

- **deps:** update to backstage 1.29 ([#1900](https://github.com/janus-idp/backstage-plugins/issues/1900)) ([f53677f](https://github.com/janus-idp/backstage-plugins/commit/f53677fb02d6df43a9de98c43a9f101a6db76802))

### Dependencies

- **@janus-idp/cli:** upgraded to 1.13.0

## @janus-idp/backstage-plugin-analytics-provider-segment [1.6.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-provider-segment@1.5.1...@janus-idp/backstage-plugin-analytics-provider-segment@1.6.0) (2024-07-23)

### Features

- **deps:** update to backstage 1.28 ([#1891](https://github.com/janus-idp/backstage-plugins/issues/1891)) ([1ba1108](https://github.com/janus-idp/backstage-plugins/commit/1ba11088e0de60e90d138944267b83600dc446e5))

## @janus-idp/backstage-plugin-analytics-provider-segment [1.5.1](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-provider-segment@1.5.0...@janus-idp/backstage-plugin-analytics-provider-segment@1.5.1) (2024-06-19)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.11.1

## @janus-idp/backstage-plugin-analytics-provider-segment [1.5.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-provider-segment@1.4.10...@janus-idp/backstage-plugin-analytics-provider-segment@1.5.0) (2024-06-13)

### Features

- **deps:** update to backstage 1.27 ([#1683](https://github.com/janus-idp/backstage-plugins/issues/1683)) ([a14869c](https://github.com/janus-idp/backstage-plugins/commit/a14869c3f4177049cb8d6552b36c3ffd17e7997d))

### Dependencies

- **@janus-idp/cli:** upgraded to 1.11.0

## @janus-idp/backstage-plugin-analytics-provider-segment [1.4.10](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-provider-segment@1.4.9...@janus-idp/backstage-plugin-analytics-provider-segment@1.4.10) (2024-06-13)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.10.1

## @janus-idp/backstage-plugin-analytics-provider-segment [1.4.9](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-provider-segment@1.4.8...@janus-idp/backstage-plugin-analytics-provider-segment@1.4.9) (2024-06-05)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.10.0

## @janus-idp/backstage-plugin-analytics-provider-segment [1.4.8](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-provider-segment@1.4.7...@janus-idp/backstage-plugin-analytics-provider-segment@1.4.8) (2024-06-04)

## @janus-idp/backstage-plugin-analytics-provider-segment [1.4.7](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-provider-segment@1.4.6...@janus-idp/backstage-plugin-analytics-provider-segment@1.4.7) (2024-06-03)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.9.0

## @janus-idp/backstage-plugin-analytics-provider-segment [1.4.6](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-provider-segment@1.4.5...@janus-idp/backstage-plugin-analytics-provider-segment@1.4.6) (2024-05-31)

## @janus-idp/backstage-plugin-analytics-provider-segment [1.4.5](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-provider-segment@1.4.4...@janus-idp/backstage-plugin-analytics-provider-segment@1.4.5) (2024-05-29)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.8.10

## @janus-idp/backstage-plugin-analytics-provider-segment [1.4.4](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-provider-segment@1.4.3...@janus-idp/backstage-plugin-analytics-provider-segment@1.4.4) (2024-05-29)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.8.9

## @janus-idp/backstage-plugin-analytics-provider-segment [1.4.3](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-provider-segment@1.4.2...@janus-idp/backstage-plugin-analytics-provider-segment@1.4.3) (2024-05-28)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.8.8

## @janus-idp/backstage-plugin-analytics-provider-segment [1.4.2](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-provider-segment@1.4.1...@janus-idp/backstage-plugin-analytics-provider-segment@1.4.2) (2024-05-16)

## @janus-idp/backstage-plugin-analytics-provider-segment [1.4.1](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-provider-segment@1.4.0...@janus-idp/backstage-plugin-analytics-provider-segment@1.4.1) (2024-05-16)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.8.7

## @janus-idp/backstage-plugin-analytics-provider-segment [1.4.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-provider-segment@1.3.6...@janus-idp/backstage-plugin-analytics-provider-segment@1.4.0) (2024-05-14)

### Features

- **deps:** use RHDH themes in the backstage app and dev pages ([#1480](https://github.com/janus-idp/backstage-plugins/issues/1480)) ([8263bf0](https://github.com/janus-idp/backstage-plugins/commit/8263bf099736cbb0d0f2316082d338ba81fa6927))

## @janus-idp/backstage-plugin-analytics-provider-segment [1.3.6](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-provider-segment@1.3.5...@janus-idp/backstage-plugin-analytics-provider-segment@1.3.6) (2024-05-09)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.8.6

## @janus-idp/backstage-plugin-analytics-provider-segment [1.3.5](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-provider-segment@1.3.4...@janus-idp/backstage-plugin-analytics-provider-segment@1.3.5) (2024-05-02)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.8.5

## @janus-idp/backstage-plugin-analytics-provider-segment [1.3.4](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-provider-segment@1.3.3...@janus-idp/backstage-plugin-analytics-provider-segment@1.3.4) (2024-05-02)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.8.4

## @janus-idp/backstage-plugin-analytics-provider-segment [1.3.3](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-provider-segment@1.3.2...@janus-idp/backstage-plugin-analytics-provider-segment@1.3.3) (2024-04-30)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.8.3

## @janus-idp/backstage-plugin-analytics-provider-segment [1.3.2](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-provider-segment@1.3.1...@janus-idp/backstage-plugin-analytics-provider-segment@1.3.2) (2024-04-30)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.8.2

## @janus-idp/backstage-plugin-analytics-provider-segment [1.3.1](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-provider-segment@1.3.0...@janus-idp/backstage-plugin-analytics-provider-segment@1.3.1) (2024-04-25)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.8.1

## @janus-idp/backstage-plugin-analytics-provider-segment [1.3.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-provider-segment@1.2.16...@janus-idp/backstage-plugin-analytics-provider-segment@1.3.0) (2024-04-15)

### Features

- checkPluginVersion.sh bump plugins for 1.2.0 release ([#1511](https://github.com/janus-idp/backstage-plugins/issues/1511)) ([73c6588](https://github.com/janus-idp/backstage-plugins/commit/73c6588adb7e8c20907b06f2a8ef248cfd4332e4))

### Dependencies

- **@janus-idp/cli:** upgraded to 1.8.0

## @janus-idp/backstage-plugin-analytics-provider-segment [1.2.16](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-provider-segment@1.2.15...@janus-idp/backstage-plugin-analytics-provider-segment@1.2.16) (2024-04-09)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.7.10

## @janus-idp/backstage-plugin-analytics-provider-segment [1.2.15](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-provider-segment@1.2.14...@janus-idp/backstage-plugin-analytics-provider-segment@1.2.15) (2024-04-09)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.7.9

## @janus-idp/backstage-plugin-analytics-provider-segment [1.2.14](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-provider-segment@1.2.13...@janus-idp/backstage-plugin-analytics-provider-segment@1.2.14) (2024-04-05)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.7.8

## @janus-idp/backstage-plugin-analytics-provider-segment [1.2.13](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-provider-segment@1.2.12...@janus-idp/backstage-plugin-analytics-provider-segment@1.2.13) (2024-04-02)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.7.7

## @janus-idp/backstage-plugin-analytics-provider-segment [1.2.12](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-provider-segment@1.2.11...@janus-idp/backstage-plugin-analytics-provider-segment@1.2.12) (2024-03-29)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.7.6

## @janus-idp/backstage-plugin-analytics-provider-segment [1.2.11](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-provider-segment@1.2.10...@janus-idp/backstage-plugin-analytics-provider-segment@1.2.11) (2024-03-04)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.7.5

## @janus-idp/backstage-plugin-analytics-provider-segment [1.2.10](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-provider-segment@1.2.9...@janus-idp/backstage-plugin-analytics-provider-segment@1.2.10) (2024-02-27)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.7.4

## @janus-idp/backstage-plugin-analytics-provider-segment [1.2.9](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-provider-segment@1.2.8...@janus-idp/backstage-plugin-analytics-provider-segment@1.2.9) (2024-02-26)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.7.3

## @janus-idp/backstage-plugin-analytics-provider-segment [1.2.8](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-provider-segment@1.2.7...@janus-idp/backstage-plugin-analytics-provider-segment@1.2.8) (2024-02-21)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.7.2

## @janus-idp/backstage-plugin-analytics-provider-segment [1.2.7](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-provider-segment@1.2.6...@janus-idp/backstage-plugin-analytics-provider-segment@1.2.7) (2024-02-05)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.7.1

## @janus-idp/backstage-plugin-analytics-provider-segment [1.2.6](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-provider-segment@1.2.5...@janus-idp/backstage-plugin-analytics-provider-segment@1.2.6) (2024-01-30)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.7.0

## @janus-idp/backstage-plugin-analytics-provider-segment [1.2.5](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-provider-segment@1.2.4...@janus-idp/backstage-plugin-analytics-provider-segment@1.2.5) (2024-01-25)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.6.0

## @janus-idp/backstage-plugin-analytics-provider-segment [1.2.4](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-provider-segment@1.2.3...@janus-idp/backstage-plugin-analytics-provider-segment@1.2.4) (2024-01-16)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.5.0

## @janus-idp/backstage-plugin-analytics-provider-segment [1.2.3](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-provider-segment@1.2.2...@janus-idp/backstage-plugin-analytics-provider-segment@1.2.3) (2023-12-07)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.4.7

## @janus-idp/backstage-plugin-analytics-provider-segment [1.2.2](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-provider-segment@1.2.1...@janus-idp/backstage-plugin-analytics-provider-segment@1.2.2) (2023-11-30)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.4.6

## @janus-idp/backstage-plugin-analytics-provider-segment [1.2.1](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-provider-segment@1.2.0...@janus-idp/backstage-plugin-analytics-provider-segment@1.2.1) (2023-11-23)

### Bug Fixes

- add config partials for dynamic frontend plugins ([#965](https://github.com/janus-idp/backstage-plugins/issues/965)) ([b01e55e](https://github.com/janus-idp/backstage-plugins/commit/b01e55e877278afc5de8d28a4c687a6989566bdc))

## @janus-idp/backstage-plugin-analytics-provider-segment [1.2.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-provider-segment@1.1.4...@janus-idp/backstage-plugin-analytics-provider-segment@1.2.0) (2023-11-22)

### Features

- **segment:** expose plugin also as a dynamic ([#955](https://github.com/janus-idp/backstage-plugins/issues/955)) ([7b80a40](https://github.com/janus-idp/backstage-plugins/commit/7b80a4088b91c2d38af64fe9338c0815225dd1d4))

## @janus-idp/backstage-plugin-analytics-provider-segment [1.1.4](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-provider-segment@1.1.3...@janus-idp/backstage-plugin-analytics-provider-segment@1.1.4) (2023-11-22)

### Bug Fixes

- segment config schema visibility typo ([#964](https://github.com/janus-idp/backstage-plugins/issues/964)) ([836c58c](https://github.com/janus-idp/backstage-plugins/commit/836c58c9be4bbac1033979151b2be0ea6de4bf37))

## @janus-idp/backstage-plugin-analytics-provider-segment [1.1.3](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-provider-segment@1.1.2...@janus-idp/backstage-plugin-analytics-provider-segment@1.1.3) (2023-10-19)

## @janus-idp/backstage-plugin-analytics-provider-segment [1.1.2](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-provider-segment@1.1.1...@janus-idp/backstage-plugin-analytics-provider-segment@1.1.2) (2023-09-22)

## @janus-idp/backstage-plugin-analytics-provider-segment [1.1.1](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-provider-segment@1.1.0...@janus-idp/backstage-plugin-analytics-provider-segment@1.1.1) (2023-08-23)

### Bug Fixes

- **config types:** inline types in config.d.ts ([#664](https://github.com/janus-idp/backstage-plugins/issues/664)) ([ae1aea1](https://github.com/janus-idp/backstage-plugins/commit/ae1aea1f4890c0034d1c2602223d59463c61206b))

## @janus-idp/backstage-plugin-analytics-provider-segment [1.1.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-provider-segment@1.0.7...@janus-idp/backstage-plugin-analytics-provider-segment@1.1.0) (2023-08-14)

### Features

- **ts:** transpile each plugin separately ([#634](https://github.com/janus-idp/backstage-plugins/issues/634)) ([b94c4dc](https://github.com/janus-idp/backstage-plugins/commit/b94c4dc50ada328e5ce1bed5fb7c76f64607e1ee))

## @janus-idp/backstage-plugin-analytics-provider-segment [1.0.7](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-provider-segment@1.0.6...@janus-idp/backstage-plugin-analytics-provider-segment@1.0.7) (2023-07-25)

## @janus-idp/backstage-plugin-analytics-provider-segment [1.0.6](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-provider-segment@1.0.5...@janus-idp/backstage-plugin-analytics-provider-segment@1.0.6) (2023-06-14)

### Other changes

- reorder imports via prettier ([#419](https://github.com/janus-idp/backstage-plugins/issues/419)) ([17f1e6a](https://github.com/janus-idp/backstage-plugins/commit/17f1e6a689bd793a619ec5e42e5cdda0998f78a5))

### Documentation

- update plugin README formatting ([#396](https://github.com/janus-idp/backstage-plugins/issues/396)) ([9b39056](https://github.com/janus-idp/backstage-plugins/commit/9b39056f6c66e9a6a0a5d0c4059420dff66db263)), closes [#295](https://github.com/janus-idp/backstage-plugins/issues/295) [#369](https://github.com/janus-idp/backstage-plugins/issues/369) [#295](https://github.com/janus-idp/backstage-plugins/issues/295) [#369](https://github.com/janus-idp/backstage-plugins/issues/369)

## @janus-idp/backstage-plugin-analytics-provider-segment [1.0.5](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-provider-segment@1.0.4...@janus-idp/backstage-plugin-analytics-provider-segment@1.0.5) (2023-05-30)

## @janus-idp/backstage-plugin-analytics-provider-segment [1.0.4](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-provider-segment@1.0.3...@janus-idp/backstage-plugin-analytics-provider-segment@1.0.4) (2023-05-30)

## @janus-idp/backstage-plugin-analytics-provider-segment [1.0.3](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-provider-segment@1.0.2...@janus-idp/backstage-plugin-analytics-provider-segment@1.0.3) (2023-05-18)

### Documentation

- update plugin READMEs ([#373](https://github.com/janus-idp/backstage-plugins/issues/373)) ([478560e](https://github.com/janus-idp/backstage-plugins/commit/478560e38cceaa40d976bccf4785956ed58b5221))

## @janus-idp/backstage-plugin-analytics-provider-segment [1.0.2](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-provider-segment@1.0.1...@janus-idp/backstage-plugin-analytics-provider-segment@1.0.2) (2023-05-17)

### Bug Fixes

- **deps:** update all non-major dependencies ([#358](https://github.com/janus-idp/backstage-plugins/issues/358)) ([086a9ed](https://github.com/janus-idp/backstage-plugins/commit/086a9ed839f3a6dd1460f0f87b71453a7ed62ea3))

## @janus-idp/backstage-plugin-analytics-provider-segment [1.0.1](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-analytics-provider-segment@1.0.0...@janus-idp/backstage-plugin-analytics-provider-segment@1.0.1) (2023-05-16)

### Bug Fixes

- **segment:** fixes the config for optional parameters ([#363](https://github.com/janus-idp/backstage-plugins/issues/363)) ([4857f5d](https://github.com/janus-idp/backstage-plugins/commit/4857f5d6f0b028e32e492f07e5d033381b467386))

### Documentation

- fix segment README ([#364](https://github.com/janus-idp/backstage-plugins/issues/364)) ([9f6ed93](https://github.com/janus-idp/backstage-plugins/commit/9f6ed9303297977864f0a3624552c454a1af64dd))
- update Segment README.md ([#362](https://github.com/janus-idp/backstage-plugins/issues/362)) ([a75d30a](https://github.com/janus-idp/backstage-plugins/commit/a75d30a376a03b44f17cb7b410c30b3817581c43))

## @janus-idp/backstage-plugin-analytics-provider-segment 1.0.0 (2023-05-15)

### Features

- **segment:** analytics plugin for Segment ([#321](https://github.com/janus-idp/backstage-plugins/issues/321)) ([a60e047](https://github.com/janus-idp/backstage-plugins/commit/a60e04760bf45efd1005edb9ddb6d77c30911d30))
