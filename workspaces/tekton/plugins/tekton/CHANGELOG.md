### Dependencies

## 3.16.3

### Patch Changes

- 41a3d82: Updated dependency `@playwright/test` to `1.48.2`.

## 3.16.2

### Patch Changes

- a6e850f: Updated dependency `msw` to `1.3.5`.
- d3d078b: Updated dependency `@types/lodash` to `4.17.13`.

## 3.16.1

### Patch Changes

- 9b803bb: Fixed `style-inject` imports in packed \*.css.esm.js files until a new version of `@backstage/cli` is released that includes https://github.com/backstage/backstage/pull/27547.

## 3.16.0

### Minor Changes

- fa93564: Migrate Tekton plugin from Janus-IDP community to Backstage community-plugins

  - The plugin now recommends and supports a new annotation to show Tekton PipelineRuns on the CI/CD tab: `tekton.dev/cicd: "true"`
  - The old annotation `janus-idp.io/tekton` is still supported. Any value there enables the plugin.
  - The plugin doesn't export `TEKTON_CI_ANNOTATION`, please use `TektonAnnotations.CICD` from `@backstage-community/plugin-tekton-common` instead. This is a minor breaking change since an update also requires a npm package change.

### Patch Changes

- Updated dependencies [fa93564]
  - @backstage-community/plugin-tekton-common@1.4.0

## 3.15.1

### Patch Changes

- 0e6bfd3: feat: update Backstage to the latest version

  Update to Backstage 1.32.5

- Updated dependencies [0e6bfd3]
  - @janus-idp/backstage-plugin-tekton-common@1.3.1
  - @janus-idp/shared-react@2.13.1

## 3.15.0

### Minor Changes

- 8244f28: chore(deps): update to backstage 1.32

### Patch Changes

- Updated dependencies [8244f28]
  - @janus-idp/backstage-plugin-tekton-common@1.3.0
  - @janus-idp/shared-react@2.13.0

## 3.14.2

### Patch Changes

- 7342e9b: chore: remove @janus-idp/cli dep and relink local packages

  This update removes `@janus-idp/cli` from all plugins, as it’s no longer necessary. Additionally, packages are now correctly linked with a specified version.

## 3.14.1

### Patch Changes

- ffe2546: Fix CVE-2024-21534 by upgrading @kubernetes/client-node package to 0.22.1
- Updated dependencies [ffe2546]
  - @janus-idp/shared-react@2.12.1

## 3.14.0

### Minor Changes

- d9551ae: feat(deps): update to backstage 1.31

### Patch Changes

- d9551ae: Change local package references to a `*`
- d9551ae: pin the @janus-idp/cli package
- d9551ae: upgrade to yarn v3
- Updated dependencies [d9551ae]
- Updated dependencies [d9551ae]
- Updated dependencies [d9551ae]
- Updated dependencies [d9551ae]
  - @janus-idp/shared-react@2.12.0
  - @janus-idp/backstage-plugin-tekton-common@1.2.0

* **@janus-idp/cli:** upgraded to 1.15.2

### Dependencies

- **@janus-idp/cli:** upgraded to 1.15.1

### Dependencies

- **@janus-idp/shared-react:** upgraded to 2.11.1
- **@janus-idp/cli:** upgraded to 1.15.0

### Dependencies

- **@janus-idp/backstage-plugin-tekton-common:** upgraded to 1.1.0
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

## @janus-idp/backstage-plugin-tekton [3.12.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@3.11.0...@janus-idp/backstage-plugin-tekton@3.12.0) (2024-08-02)

### Features

- **topology:** remove usage of k8s plugin from topology & tekton plugins ([#1869](https://github.com/janus-idp/backstage-plugins/issues/1869)) ([ae7d8ee](https://github.com/janus-idp/backstage-plugins/commit/ae7d8ee7014c109a5f5265967590559fc778eec7))

### Dependencies

- **@janus-idp/shared-react:** upgraded to 2.10.0
- **@janus-idp/backstage-plugin-tekton-common:** upgraded to 1.0.0

## @janus-idp/backstage-plugin-tekton [3.11.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@3.10.0...@janus-idp/backstage-plugin-tekton@3.11.0) (2024-07-26)

### Features

- **tekton:** add permissions support for tekton plugin ([#1854](https://github.com/janus-idp/backstage-plugins/issues/1854)) ([f744896](https://github.com/janus-idp/backstage-plugins/commit/f7448963c252574e0309a091563c19e1ed9a58fd))

## @janus-idp/backstage-plugin-tekton [3.10.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@3.9.0...@janus-idp/backstage-plugin-tekton@3.10.0) (2024-07-26)

### Features

- **deps:** update to backstage 1.29 ([#1900](https://github.com/janus-idp/backstage-plugins/issues/1900)) ([f53677f](https://github.com/janus-idp/backstage-plugins/commit/f53677fb02d6df43a9de98c43a9f101a6db76802))

### Dependencies

- **@janus-idp/shared-react:** upgraded to 2.9.0

## @janus-idp/backstage-plugin-tekton [3.9.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@3.8.1...@janus-idp/backstage-plugin-tekton@3.9.0) (2024-07-24)

### Features

- **deps:** update to backstage 1.28 ([#1891](https://github.com/janus-idp/backstage-plugins/issues/1891)) ([1ba1108](https://github.com/janus-idp/backstage-plugins/commit/1ba11088e0de60e90d138944267b83600dc446e5))

### Dependencies

- **@janus-idp/shared-react:** upgraded to 2.8.0

## @janus-idp/backstage-plugin-tekton [3.8.1](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@3.8.0...@janus-idp/backstage-plugin-tekton@3.8.1) (2024-06-19)

### Dependencies

- **@janus-idp/shared-react:** upgraded to 2.7.1
- **@janus-idp/cli:** upgraded to 1.11.1

## @janus-idp/backstage-plugin-tekton [3.8.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@3.7.9...@janus-idp/backstage-plugin-tekton@3.8.0) (2024-06-13)

### Features

- **deps:** update to backstage 1.27 ([#1683](https://github.com/janus-idp/backstage-plugins/issues/1683)) ([a14869c](https://github.com/janus-idp/backstage-plugins/commit/a14869c3f4177049cb8d6552b36c3ffd17e7997d))

### Dependencies

- **@janus-idp/shared-react:** upgraded to 2.7.0
- **@janus-idp/cli:** upgraded to 1.11.0

## @janus-idp/backstage-plugin-tekton [3.7.9](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@3.7.8...@janus-idp/backstage-plugin-tekton@3.7.9) (2024-06-13)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.10.1

## @janus-idp/backstage-plugin-tekton [3.7.8](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@3.7.7...@janus-idp/backstage-plugin-tekton@3.7.8) (2024-06-10)

## @janus-idp/backstage-plugin-tekton [3.7.7](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@3.7.6...@janus-idp/backstage-plugin-tekton@3.7.7) (2024-06-05)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.10.0

## @janus-idp/backstage-plugin-tekton [3.7.6](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@3.7.5...@janus-idp/backstage-plugin-tekton@3.7.6) (2024-06-04)

## @janus-idp/backstage-plugin-tekton [3.7.5](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@3.7.4...@janus-idp/backstage-plugin-tekton@3.7.5) (2024-06-03)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.9.0

## @janus-idp/backstage-plugin-tekton [3.7.4](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@3.7.3...@janus-idp/backstage-plugin-tekton@3.7.4) (2024-05-31)

## @janus-idp/backstage-plugin-tekton [3.7.3](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@3.7.2...@janus-idp/backstage-plugin-tekton@3.7.3) (2024-05-29)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.8.10

## @janus-idp/backstage-plugin-tekton [3.7.2](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@3.7.1...@janus-idp/backstage-plugin-tekton@3.7.2) (2024-05-29)

### Dependencies

- **@janus-idp/shared-react:** upgraded to 2.6.3
- **@janus-idp/cli:** upgraded to 1.8.9

## @janus-idp/backstage-plugin-tekton [3.7.1](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@3.7.0...@janus-idp/backstage-plugin-tekton@3.7.1) (2024-05-16)

### Dependencies

- **@janus-idp/shared-react:** upgraded to 2.6.2
- **@janus-idp/cli:** upgraded to 1.8.7

## @janus-idp/backstage-plugin-tekton [3.7.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@3.6.5...@janus-idp/backstage-plugin-tekton@3.7.0) (2024-05-14)

### Features

- **deps:** use RHDH themes in the backstage app and dev pages ([#1480](https://github.com/janus-idp/backstage-plugins/issues/1480)) ([8263bf0](https://github.com/janus-idp/backstage-plugins/commit/8263bf099736cbb0d0f2316082d338ba81fa6927))

## @janus-idp/backstage-plugin-tekton [3.6.5](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@3.6.4...@janus-idp/backstage-plugin-tekton@3.6.5) (2024-05-09)

### Dependencies

- **@janus-idp/shared-react:** upgraded to 2.6.1
- **@janus-idp/cli:** upgraded to 1.8.6

## @janus-idp/backstage-plugin-tekton [3.6.4](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@3.6.3...@janus-idp/backstage-plugin-tekton@3.6.4) (2024-05-02)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.8.5

## @janus-idp/backstage-plugin-tekton [3.6.3](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@3.6.2...@janus-idp/backstage-plugin-tekton@3.6.3) (2024-05-02)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.8.4

## @janus-idp/backstage-plugin-tekton [3.6.2](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@3.6.1...@janus-idp/backstage-plugin-tekton@3.6.2) (2024-04-30)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.8.3

## @janus-idp/backstage-plugin-tekton [3.6.1](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@3.6.0...@janus-idp/backstage-plugin-tekton@3.6.1) (2024-04-30)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.8.2

## @janus-idp/backstage-plugin-tekton [3.6.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@3.5.18...@janus-idp/backstage-plugin-tekton@3.6.0) (2024-04-15)

### Features

- checkPluginVersion.sh bump plugins for 1.2.0 release ([#1511](https://github.com/janus-idp/backstage-plugins/issues/1511)) ([73c6588](https://github.com/janus-idp/backstage-plugins/commit/73c6588adb7e8c20907b06f2a8ef248cfd4332e4))

### Dependencies

- **@janus-idp/shared-react:** upgraded to 2.6.0
- **@janus-idp/cli:** upgraded to 1.8.0

## @janus-idp/backstage-plugin-tekton [3.5.18](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@3.5.17...@janus-idp/backstage-plugin-tekton@3.5.18) (2024-04-09)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.7.10

## @janus-idp/backstage-plugin-tekton [3.5.17](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@3.5.16...@janus-idp/backstage-plugin-tekton@3.5.17) (2024-04-09)

### Dependencies

- **@janus-idp/shared-react:** upgraded to 2.5.5

## @janus-idp/backstage-plugin-tekton [3.5.16](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@3.5.15...@janus-idp/backstage-plugin-tekton@3.5.16) (2024-04-09)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.7.9

## @janus-idp/backstage-plugin-tekton [3.5.15](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@3.5.14...@janus-idp/backstage-plugin-tekton@3.5.15) (2024-04-08)

### Dependencies

- **@janus-idp/shared-react:** upgraded to 2.5.4

## @janus-idp/backstage-plugin-tekton [3.5.14](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@3.5.13...@janus-idp/backstage-plugin-tekton@3.5.14) (2024-04-02)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.7.7

## @janus-idp/backstage-plugin-tekton [3.5.13](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@3.5.12...@janus-idp/backstage-plugin-tekton@3.5.13) (2024-03-29)

### Dependencies

- **@janus-idp/shared-react:** upgraded to 2.5.3
- **@janus-idp/cli:** upgraded to 1.7.6

## @janus-idp/backstage-plugin-tekton [3.5.12](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@3.5.11...@janus-idp/backstage-plugin-tekton@3.5.12) (2024-03-25)

### Bug Fixes

- **tekton:** bump aonic-ui/pipelines package to fix acs table crashing issue ([#1382](https://github.com/janus-idp/backstage-plugins/issues/1382)) ([b37cc94](https://github.com/janus-idp/backstage-plugins/commit/b37cc94ad140be43896bbd3bc48dd7af582eb7ff))

## @janus-idp/backstage-plugin-tekton [3.5.11](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@3.5.10...@janus-idp/backstage-plugin-tekton@3.5.11) (2024-03-19)

### Bug Fixes

- **tekton:** fix low vulnerability tooltip text ([#1347](https://github.com/janus-idp/backstage-plugins/issues/1347)) ([47640a5](https://github.com/janus-idp/backstage-plugins/commit/47640a5c3a7ad33ad6ae6b190f2ca3d861970d94))

## @janus-idp/backstage-plugin-tekton [3.5.10](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@3.5.9...@janus-idp/backstage-plugin-tekton@3.5.10) (2024-03-04)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.7.5

## @janus-idp/backstage-plugin-tekton [3.5.9](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@3.5.8...@janus-idp/backstage-plugin-tekton@3.5.9) (2024-02-27)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.7.4

## @janus-idp/backstage-plugin-tekton [3.5.8](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@3.5.7...@janus-idp/backstage-plugin-tekton@3.5.8) (2024-02-26)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.7.3

## @janus-idp/backstage-plugin-tekton [3.5.7](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@3.5.6...@janus-idp/backstage-plugin-tekton@3.5.7) (2024-02-21)

### Other changes

- **tekton:** add playwright tests for the plugin ([#1228](https://github.com/janus-idp/backstage-plugins/issues/1228)) ([705afc2](https://github.com/janus-idp/backstage-plugins/commit/705afc2892839f39a8cbad39f51c959aa3ac4c8a))

### Dependencies

- **@janus-idp/shared-react:** upgraded to 2.5.2
- **@janus-idp/cli:** upgraded to 1.7.2

## @janus-idp/backstage-plugin-tekton [3.5.6](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@3.5.5...@janus-idp/backstage-plugin-tekton@3.5.6) (2024-02-16)

### Bug Fixes

- **tekton:** upgrade to use latest @aonic-ui/pipelines package ([#1212](https://github.com/janus-idp/backstage-plugins/issues/1212)) ([0ae37f7](https://github.com/janus-idp/backstage-plugins/commit/0ae37f7a6c56df374e0e4e326397617ccd46aca8))

## @janus-idp/backstage-plugin-tekton [3.5.5](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@3.5.4...@janus-idp/backstage-plugin-tekton@3.5.5) (2024-02-07)

### Bug Fixes

- **topology/tekton:** stop polling after log streaming completes ([#1122](https://github.com/janus-idp/backstage-plugins/issues/1122)) ([191bac2](https://github.com/janus-idp/backstage-plugins/commit/191bac2d21259b4fdc42193c6cf436987968eb88))

## @janus-idp/backstage-plugin-tekton [3.5.4](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@3.5.3...@janus-idp/backstage-plugin-tekton@3.5.4) (2024-02-05)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.7.1

## @janus-idp/backstage-plugin-tekton [3.5.3](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@3.5.2...@janus-idp/backstage-plugin-tekton@3.5.3) (2024-02-02)

### Bug Fixes

- **tekton:** external sbom view action should not open logs modal ([#1152](https://github.com/janus-idp/backstage-plugins/issues/1152)) ([714ac5d](https://github.com/janus-idp/backstage-plugins/commit/714ac5d10a5b878232dc1468ebfa03a7a52aa656))
- **tekton:** fix [#947](https://github.com/janus-idp/backstage-plugins/issues/947): Reset pagination when changing any filter ([#1140](https://github.com/janus-idp/backstage-plugins/issues/1140)) ([5a1a2f4](https://github.com/janus-idp/backstage-plugins/commit/5a1a2f442e2c5957bd725e57066448e5b67d8807))

### Documentation

- **tekton:** add tekton plugin documentation to enable UI elements ([#1148](https://github.com/janus-idp/backstage-plugins/issues/1148)) ([91742e8](https://github.com/janus-idp/backstage-plugins/commit/91742e8c524a8b4f87fe9a6cb0d1f5006661b4d2))

### Dependencies

- **@janus-idp/shared-react:** upgraded to 2.5.1

## @janus-idp/backstage-plugin-tekton [3.5.2](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@3.5.1...@janus-idp/backstage-plugin-tekton@3.5.2) (2024-01-31)

### Bug Fixes

- **tekton:** fix [#922](https://github.com/janus-idp/backstage-plugins/issues/922) and [#962](https://github.com/janus-idp/backstage-plugins/issues/962) by using full width for pipeline visualization ([#1145](https://github.com/janus-idp/backstage-plugins/issues/1145)) ([1ea9f01](https://github.com/janus-idp/backstage-plugins/commit/1ea9f01c3487035f8495bb98fce30c6c34396510))

## @janus-idp/backstage-plugin-tekton [3.5.1](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@3.5.0...@janus-idp/backstage-plugin-tekton@3.5.1) (2024-01-30)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.7.0

## @janus-idp/backstage-plugin-tekton [3.5.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@3.4.2...@janus-idp/backstage-plugin-tekton@3.5.0) (2024-01-30)

### Features

- **tekton:** add view output action in pipelinerun list view ([#1128](https://github.com/janus-idp/backstage-plugins/issues/1128)) ([ad50c44](https://github.com/janus-idp/backstage-plugins/commit/ad50c44233332b0f1325cef5a41d82ba79c538fb))

### Dependencies

- **@janus-idp/shared-react:** upgraded to 2.5.0

## @janus-idp/backstage-plugin-tekton [3.4.2](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@3.4.1...@janus-idp/backstage-plugin-tekton@3.4.2) (2024-01-25)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.6.0

## @janus-idp/backstage-plugin-tekton [3.4.1](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@3.4.0...@janus-idp/backstage-plugin-tekton@3.4.1) (2024-01-17)

### Dependencies

- **@janus-idp/shared-react:** upgraded to 2.4.0

## @janus-idp/backstage-plugin-tekton [3.4.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@3.3.0...@janus-idp/backstage-plugin-tekton@3.4.0) (2023-12-22)

### Features

- **tekton:** add CVE summary and signed badge ([#1028](https://github.com/janus-idp/backstage-plugins/issues/1028)) ([effdef0](https://github.com/janus-idp/backstage-plugins/commit/effdef085deaeea78a819d1bde960f83820ec705))

### Dependencies

- **@janus-idp/shared-react:** upgraded to 2.3.0

## @janus-idp/backstage-plugin-tekton [3.3.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@3.2.0...@janus-idp/backstage-plugin-tekton@3.3.0) (2023-12-20)

### Features

- **tekton:** add view logs and view sbom actions in the pipelineRun list ([#1003](https://github.com/janus-idp/backstage-plugins/issues/1003)) ([c7eff5f](https://github.com/janus-idp/backstage-plugins/commit/c7eff5f33daef8eaba58df7e987b44f09c7a8ff9))

### Dependencies

- **@janus-idp/shared-react:** upgraded to 2.2.0

## @janus-idp/backstage-plugin-tekton [3.2.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@3.1.14...@janus-idp/backstage-plugin-tekton@3.2.0) (2023-12-14)

### Features

- **tekton:** add support for downloading task and pipelinerun logs ([#1014](https://github.com/janus-idp/backstage-plugins/issues/1014)) ([f588292](https://github.com/janus-idp/backstage-plugins/commit/f5882921756a7aa6d5a74d8fdb6bfc52a7c0c209))

### Dependencies

- **@janus-idp/shared-react:** upgraded to 2.1.0

## @janus-idp/backstage-plugin-tekton [3.1.14](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@3.1.13...@janus-idp/backstage-plugin-tekton@3.1.14) (2023-12-07)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.4.7

## @janus-idp/backstage-plugin-tekton [3.1.13](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@3.1.12...@janus-idp/backstage-plugin-tekton@3.1.13) (2023-12-07)

### Bug Fixes

- **tekton:** fix expand collapse with sorting of PLR list table ([#980](https://github.com/janus-idp/backstage-plugins/issues/980)) ([d5fc710](https://github.com/janus-idp/backstage-plugins/commit/d5fc710c09e272583e27dbf5beaa3694d18100fe))

## @janus-idp/backstage-plugin-tekton [3.1.12](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@3.1.11...@janus-idp/backstage-plugin-tekton@3.1.12) (2023-11-30)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.4.6

## @janus-idp/backstage-plugin-tekton [3.1.11](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@3.1.10...@janus-idp/backstage-plugin-tekton@3.1.11) (2023-11-23)

### Bug Fixes

- add config partials for dynamic frontend plugins ([#965](https://github.com/janus-idp/backstage-plugins/issues/965)) ([b01e55e](https://github.com/janus-idp/backstage-plugins/commit/b01e55e877278afc5de8d28a4c687a6989566bdc))

## @janus-idp/backstage-plugin-tekton [3.1.10](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@3.1.9...@janus-idp/backstage-plugin-tekton@3.1.10) (2023-11-23)

### Bug Fixes

- **tekton:** update tekton version in the documentation ([#958](https://github.com/janus-idp/backstage-plugins/issues/958)) ([51cc924](https://github.com/janus-idp/backstage-plugins/commit/51cc924b1341d04aa75a1713713c8a6700b2c0a3))

### Dependencies

- **@janus-idp/shared-react:** upgraded to 2.0.1

## @janus-idp/backstage-plugin-tekton [3.1.9](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@3.1.8...@janus-idp/backstage-plugin-tekton@3.1.9) (2023-11-22)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.4.5

## @janus-idp/backstage-plugin-tekton [3.1.8](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@3.1.7...@janus-idp/backstage-plugin-tekton@3.1.8) (2023-11-21)

### Bug Fixes

- sync versions in dynamic assets and publish derived packages as additional packages ([#963](https://github.com/janus-idp/backstage-plugins/issues/963)) ([7d0a386](https://github.com/janus-idp/backstage-plugins/commit/7d0a38609b4a18b54c75378a150e8b5c3ba8ff43))
- **tekton:** fix sorting for pipeline run durations ([#952](https://github.com/janus-idp/backstage-plugins/issues/952)) ([dc711dd](https://github.com/janus-idp/backstage-plugins/commit/dc711dd24b267a8ba7671e5380d84179e65f4995))

## @janus-idp/backstage-plugin-tekton [3.1.7](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@3.1.6...@janus-idp/backstage-plugin-tekton@3.1.7) (2023-11-20)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.4.4

## @janus-idp/backstage-plugin-tekton [3.1.6](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@3.1.5...@janus-idp/backstage-plugin-tekton@3.1.6) (2023-11-16)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.4.3

## @janus-idp/backstage-plugin-tekton [3.1.5](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@3.1.4...@janus-idp/backstage-plugin-tekton@3.1.5) (2023-11-13)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.4.2

## @janus-idp/backstage-plugin-tekton [3.1.4](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@3.1.3...@janus-idp/backstage-plugin-tekton@3.1.4) (2023-11-13)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.4.1

## @janus-idp/backstage-plugin-tekton [3.1.3](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@3.1.2...@janus-idp/backstage-plugin-tekton@3.1.3) (2023-11-07)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.4.0

## @janus-idp/backstage-plugin-tekton [3.1.2](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@3.1.1...@janus-idp/backstage-plugin-tekton@3.1.2) (2023-11-06)

### Bug Fixes

- **cli:** add default scalprum config ([#909](https://github.com/janus-idp/backstage-plugins/issues/909)) ([d74fc72](https://github.com/janus-idp/backstage-plugins/commit/d74fc72ab7e0a843da047c7b6570d8a6fbc068e1))

### Dependencies

- **@janus-idp/cli:** upgraded to 1.3.3

## @janus-idp/backstage-plugin-tekton [3.1.1](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@3.1.0...@janus-idp/backstage-plugin-tekton@3.1.1) (2023-11-02)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.3.2

## @janus-idp/backstage-plugin-tekton [3.1.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@3.0.2...@janus-idp/backstage-plugin-tekton@3.1.0) (2023-11-01)

### Features

- **dynamic-plugins:** publish dynamic assets for all frontend plugins ([#896](https://github.com/janus-idp/backstage-plugins/issues/896)) ([dcfb0ac](https://github.com/janus-idp/backstage-plugins/commit/dcfb0ac56769c82f6b8b2cef2726251e0b60c375))

## @janus-idp/backstage-plugin-tekton [3.0.2](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@3.0.1...@janus-idp/backstage-plugin-tekton@3.0.2) (2023-10-27)

### Bug Fixes

- **tekton:** handle flaky cluster error gracefully ([#887](https://github.com/janus-idp/backstage-plugins/issues/887)) ([10ed80e](https://github.com/janus-idp/backstage-plugins/commit/10ed80e4882d473eaee8319a9b1643b14f99a203))

## @janus-idp/backstage-plugin-tekton [3.0.1](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@3.0.0...@janus-idp/backstage-plugin-tekton@3.0.1) (2023-10-26)

### Bug Fixes

- **tekton:** update README and cleanup ([#881](https://github.com/janus-idp/backstage-plugins/issues/881)) ([c495515](https://github.com/janus-idp/backstage-plugins/commit/c495515bc146dfb9e2b64ec8df50d2e5fe01a6c7))

## @janus-idp/backstage-plugin-tekton [3.0.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@2.0.2...@janus-idp/backstage-plugin-tekton@3.0.0) (2023-10-23)

### ⚠ BREAKING CHANGES

- **tekton:** update tekton UX (#839)

### Features

- **tekton:** update tekton UX ([#839](https://github.com/janus-idp/backstage-plugins/issues/839)) ([789c945](https://github.com/janus-idp/backstage-plugins/commit/789c945580b8f82349a5c62b98c77d5dbf4781f1))

### Dependencies

- **@janus-idp/shared-react:** upgraded to 2.0.0

## @janus-idp/backstage-plugin-tekton [2.0.2](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@2.0.1...@janus-idp/backstage-plugin-tekton@2.0.2) (2023-10-19)

### Dependencies

- **@janus-idp/shared-react:** upgraded to 1.3.3

## @janus-idp/backstage-plugin-tekton [2.0.1](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@2.0.0...@janus-idp/backstage-plugin-tekton@2.0.1) (2023-10-16)

### Bug Fixes

- **tekton:** fix pipelinerun status icon color ([#734](https://github.com/janus-idp/backstage-plugins/issues/734)) ([c800f98](https://github.com/janus-idp/backstage-plugins/commit/c800f987afc9a96bec93c13295d8fdb0c5964a93))

### Dependencies

- **@janus-idp/shared-react:** upgraded to 1.3.2

## @janus-idp/backstage-plugin-tekton [2.0.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@1.9.6...@janus-idp/backstage-plugin-tekton@2.0.0) (2023-10-09)

### ⚠ BREAKING CHANGES

- **tekton:** enable tekton related features when the tekton annotation is present (#741)

### Features

- **tekton:** enable tekton related features when the tekton annotation is present ([#741](https://github.com/janus-idp/backstage-plugins/issues/741)) ([474d3f0](https://github.com/janus-idp/backstage-plugins/commit/474d3f01bb312a668bc8b39dc4c78f6f52b5cf87))

## @janus-idp/backstage-plugin-tekton [1.9.6](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@1.9.5...@janus-idp/backstage-plugin-tekton@1.9.6) (2023-09-22)

### Dependencies

- **@janus-idp/shared-react:** upgraded to 1.3.1

## @janus-idp/backstage-plugin-tekton [1.9.5](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@1.9.4...@janus-idp/backstage-plugin-tekton@1.9.5) (2023-09-11)

## @janus-idp/backstage-plugin-tekton [1.9.4](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@1.9.3...@janus-idp/backstage-plugin-tekton@1.9.4) (2023-09-05)

### Documentation

- **tekton:** minor changes in tekton documentation ([#691](https://github.com/janus-idp/backstage-plugins/issues/691)) ([02a18fb](https://github.com/janus-idp/backstage-plugins/commit/02a18fb75a31fbbd221385ac18e5c05cecec0d7d))

## @janus-idp/backstage-plugin-tekton [1.9.3](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@1.9.2...@janus-idp/backstage-plugin-tekton@1.9.3) (2023-08-28)

### Documentation

- **tekton:** updated images ([#606](https://github.com/janus-idp/backstage-plugins/issues/606)) ([b138c64](https://github.com/janus-idp/backstage-plugins/commit/b138c64b5476216eac38a5553b05751e3df736f1))

## @janus-idp/backstage-plugin-tekton [1.9.2](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@1.9.1...@janus-idp/backstage-plugin-tekton@1.9.2) (2023-08-24)

### Documentation

- update tekton and topology documentation with pod log permissions ([#668](https://github.com/janus-idp/backstage-plugins/issues/668)) ([5b0a9f7](https://github.com/janus-idp/backstage-plugins/commit/5b0a9f77448d624c50f58e19d7f439700bef9cfe))

## @janus-idp/backstage-plugin-tekton [1.9.1](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@1.9.0...@janus-idp/backstage-plugin-tekton@1.9.1) (2023-08-22)

### Bug Fixes

- **tekton:** fix code smells ([#632](https://github.com/janus-idp/backstage-plugins/issues/632)) ([2ad13da](https://github.com/janus-idp/backstage-plugins/commit/2ad13dac8ae27959d74d45c91da01c95e7b80e20))

## @janus-idp/backstage-plugin-tekton [1.9.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@1.8.3...@janus-idp/backstage-plugin-tekton@1.9.0) (2023-08-14)

### Features

- **ts:** transpile each plugin separately ([#634](https://github.com/janus-idp/backstage-plugins/issues/634)) ([b94c4dc](https://github.com/janus-idp/backstage-plugins/commit/b94c4dc50ada328e5ce1bed5fb7c76f64607e1ee))

### Dependencies

- **@janus-idp/shared-react:** upgraded to 1.3.0

## @janus-idp/backstage-plugin-tekton [1.8.3](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@1.8.2...@janus-idp/backstage-plugin-tekton@1.8.3) (2023-08-14)

### Dependencies

- **@janus-idp/shared-react:** upgraded to 1.2.2

## @janus-idp/backstage-plugin-tekton [1.8.2](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@1.8.1...@janus-idp/backstage-plugin-tekton@1.8.2) (2023-08-14)

### Dependencies

- **@janus-idp/shared-react:** upgraded to 1.2.1

## @janus-idp/backstage-plugin-tekton [1.8.1](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@1.8.0...@janus-idp/backstage-plugin-tekton@1.8.1) (2023-08-11)

### Dependencies

- **@janus-idp/shared-react:** upgraded to 1.2.0

## @janus-idp/backstage-plugin-tekton [1.8.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@1.7.2...@janus-idp/backstage-plugin-tekton@1.8.0) (2023-08-10)

### Features

- **tekton:** visualize pipelinerun logs ([#553](https://github.com/janus-idp/backstage-plugins/issues/553)) ([540a105](https://github.com/janus-idp/backstage-plugins/commit/540a105287ee557de724f44389e9c571405d0a3d))

## @janus-idp/backstage-plugin-tekton [1.7.2](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@1.7.1...@janus-idp/backstage-plugin-tekton@1.7.2) (2023-08-10)

### Dependencies

- **@janus-idp/shared-react:** upgraded to 1.1.1

## @janus-idp/backstage-plugin-tekton [1.7.1](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@1.7.0...@janus-idp/backstage-plugin-tekton@1.7.1) (2023-08-09)

### Bug Fixes

- **tekton:** use shared-react package ([#623](https://github.com/janus-idp/backstage-plugins/issues/623)) ([57672c0](https://github.com/janus-idp/backstage-plugins/commit/57672c0d7f5549360e2cef19421648f3fea1f332))

## @janus-idp/backstage-plugin-tekton [1.7.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@1.6.0...@janus-idp/backstage-plugin-tekton@1.7.0) (2023-07-25)

### Features

- **tekton:** view pipelinerun visualization on click of pipelinerun ([#506](https://github.com/janus-idp/backstage-plugins/issues/506)) ([092d2bd](https://github.com/janus-idp/backstage-plugins/commit/092d2bd55d69171f9d3c290c9346c7d13dafcf97))

## @janus-idp/backstage-plugin-tekton [1.6.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@1.5.2...@janus-idp/backstage-plugin-tekton@1.6.0) (2023-07-10)

### Features

- **tekton:** create paginated table using Backstage core components ([#503](https://github.com/janus-idp/backstage-plugins/issues/503)) ([5cc47c1](https://github.com/janus-idp/backstage-plugins/commit/5cc47c1a346a4f006adf88ad15c942be5151b913))

## @janus-idp/backstage-plugin-tekton [1.5.2](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@1.5.1...@janus-idp/backstage-plugin-tekton@1.5.2) (2023-06-30)

### Bug Fixes

- **tekton:** fix pipelinerun task status info ([#491](https://github.com/janus-idp/backstage-plugins/issues/491)) ([191ba44](https://github.com/janus-idp/backstage-plugins/commit/191ba44fd3e5c7e092a5b0231325427300383a0e))

## @janus-idp/backstage-plugin-tekton [1.5.1](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@1.5.0...@janus-idp/backstage-plugin-tekton@1.5.1) (2023-06-14)

### Other changes

- reorder imports via prettier ([#419](https://github.com/janus-idp/backstage-plugins/issues/419)) ([17f1e6a](https://github.com/janus-idp/backstage-plugins/commit/17f1e6a689bd793a619ec5e42e5cdda0998f78a5))

### Documentation

- update plugin README formatting ([#396](https://github.com/janus-idp/backstage-plugins/issues/396)) ([9b39056](https://github.com/janus-idp/backstage-plugins/commit/9b39056f6c66e9a6a0a5d0c4059420dff66db263)), closes [#295](https://github.com/janus-idp/backstage-plugins/issues/295) [#369](https://github.com/janus-idp/backstage-plugins/issues/369) [#295](https://github.com/janus-idp/backstage-plugins/issues/295) [#369](https://github.com/janus-idp/backstage-plugins/issues/369)

## @janus-idp/backstage-plugin-tekton [1.5.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@1.4.14...@janus-idp/backstage-plugin-tekton@1.5.0) (2023-05-31)

### Features

- **tekton:** show cluster label before the select dropdown ([#345](https://github.com/janus-idp/backstage-plugins/issues/345)) ([582586e](https://github.com/janus-idp/backstage-plugins/commit/582586eca35af76fa931ace6d823e74dd4012215))

## @janus-idp/backstage-plugin-tekton [1.4.14](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@1.4.13...@janus-idp/backstage-plugin-tekton@1.4.14) (2023-05-30)

## @janus-idp/backstage-plugin-tekton [1.4.13](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@1.4.12...@janus-idp/backstage-plugin-tekton@1.4.13) (2023-05-30)

## @janus-idp/backstage-plugin-tekton [1.4.12](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@1.4.11...@janus-idp/backstage-plugin-tekton@1.4.12) (2023-05-30)

### Bug Fixes

- **tekton:** in case of bad configuration show empty state for tekton plugin and no cluster selector ([#390](https://github.com/janus-idp/backstage-plugins/issues/390)) ([83e47df](https://github.com/janus-idp/backstage-plugins/commit/83e47df6247cf9dccc0842eec1380b37e58bea47))

## @janus-idp/backstage-plugin-tekton [1.4.11](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@1.4.10...@janus-idp/backstage-plugin-tekton@1.4.11) (2023-05-29)

### Bug Fixes

- **tekton:** handles unnecessary rerenders on tekton ([#391](https://github.com/janus-idp/backstage-plugins/issues/391)) ([86c1700](https://github.com/janus-idp/backstage-plugins/commit/86c1700a89db238dda0efca23ada72c94a2ee72b))

## @janus-idp/backstage-plugin-tekton [1.4.10](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@1.4.9...@janus-idp/backstage-plugin-tekton@1.4.10) (2023-05-22)

### Documentation

- **tekton:** add user docs ([#365](https://github.com/janus-idp/backstage-plugins/issues/365)) ([4dc7e1a](https://github.com/janus-idp/backstage-plugins/commit/4dc7e1a2a81676642a24905d720967cfb78f4194))

## @janus-idp/backstage-plugin-tekton [1.4.9](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@1.4.8...@janus-idp/backstage-plugin-tekton@1.4.9) (2023-05-18)

### Documentation

- update plugin READMEs ([#373](https://github.com/janus-idp/backstage-plugins/issues/373)) ([478560e](https://github.com/janus-idp/backstage-plugins/commit/478560e38cceaa40d976bccf4785956ed58b5221))

## @janus-idp/backstage-plugin-tekton [1.4.8](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@1.4.7...@janus-idp/backstage-plugin-tekton@1.4.8) (2023-05-17)

### Bug Fixes

- **deps:** update all non-major dependencies ([#358](https://github.com/janus-idp/backstage-plugins/issues/358)) ([086a9ed](https://github.com/janus-idp/backstage-plugins/commit/086a9ed839f3a6dd1460f0f87b71453a7ed62ea3))

## @janus-idp/backstage-plugin-tekton [1.4.7](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@1.4.6...@janus-idp/backstage-plugin-tekton@1.4.7) (2023-05-15)

## @janus-idp/backstage-plugin-tekton [1.4.6](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@1.4.5...@janus-idp/backstage-plugin-tekton@1.4.6) (2023-05-15)

## @janus-idp/backstage-plugin-tekton [1.4.5](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@1.4.4...@janus-idp/backstage-plugin-tekton@1.4.5) (2023-05-11)

### Bug Fixes

- **deps:** update all non-major dependencies ([#339](https://github.com/janus-idp/backstage-plugins/issues/339)) ([d19d96d](https://github.com/janus-idp/backstage-plugins/commit/d19d96de7b55c205e0f77528e476104c0685aad2))

## @janus-idp/backstage-plugin-tekton [1.4.4](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@1.4.3...@janus-idp/backstage-plugin-tekton@1.4.4) (2023-05-09)

### Bug Fixes

- **plugins:** remove React.FC types ([#335](https://github.com/janus-idp/backstage-plugins/issues/335)) ([f3d40af](https://github.com/janus-idp/backstage-plugins/commit/f3d40af9c6e55e5699ed78d07ae6617e25b33c18))

## @janus-idp/backstage-plugin-tekton [1.4.3](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@1.4.2...@janus-idp/backstage-plugin-tekton@1.4.3) (2023-05-09)

### Other changes

- **deps:** update all non-major dependencies ([#333](https://github.com/janus-idp/backstage-plugins/issues/333)) ([dce0ea4](https://github.com/janus-idp/backstage-plugins/commit/dce0ea4a9b9f517bd864d39f0b364c68e6a2e143))
- **plugins:** remove react namespace import ([#336](https://github.com/janus-idp/backstage-plugins/issues/336)) ([01ab4aa](https://github.com/janus-idp/backstage-plugins/commit/01ab4aaf9c88c58c955903372b556f33e2e6461e))

## @janus-idp/backstage-plugin-tekton [1.4.2](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@1.4.1...@janus-idp/backstage-plugin-tekton@1.4.2) (2023-05-04)

### Other changes

- **deps:** update all non-major dependencies ([#127](https://github.com/janus-idp/backstage-plugins/issues/127)) ([a9d359f](https://github.com/janus-idp/backstage-plugins/commit/a9d359f01448d1b9b4b4d3d9b087052fb6ff16b3))

## @janus-idp/backstage-plugin-tekton [1.4.1](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@1.4.0...@janus-idp/backstage-plugin-tekton@1.4.1) (2023-05-02)

### Bug Fixes

- **tekton:** fix task node status ([#320](https://github.com/janus-idp/backstage-plugins/issues/320)) ([22b0b1e](https://github.com/janus-idp/backstage-plugins/commit/22b0b1ece1b0da5e3ac49949b6ac57dd116f564b))

## @janus-idp/backstage-plugin-tekton [1.4.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@1.3.0...@janus-idp/backstage-plugin-tekton@1.4.0) (2023-04-28)

### Features

- **tekton:** add cluster selector in the pipeline vis card ([#308](https://github.com/janus-idp/backstage-plugins/issues/308)) ([e321ba9](https://github.com/janus-idp/backstage-plugins/commit/e321ba9a18a8e72af86abe1df7d8ea47d429e3a5))

## @janus-idp/backstage-plugin-tekton [1.3.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@1.2.0...@janus-idp/backstage-plugin-tekton@1.3.0) (2023-04-28)

### Features

- **tekton:** tekton pipeline run list sort ([#253](https://github.com/janus-idp/backstage-plugins/issues/253)) ([356f637](https://github.com/janus-idp/backstage-plugins/commit/356f637d183eaa58e27be383db5834167f13c058))

## @janus-idp/backstage-plugin-tekton [1.2.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@1.1.1...@janus-idp/backstage-plugin-tekton@1.2.0) (2023-04-25)

### Features

- **tekton:** add latest pipelineRun visualization ([#242](https://github.com/janus-idp/backstage-plugins/issues/242)) ([87f7f5c](https://github.com/janus-idp/backstage-plugins/commit/87f7f5c3753c100dfd50fe8e6359e22651cfb3ae))

## @janus-idp/backstage-plugin-tekton [1.1.1](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@1.1.0...@janus-idp/backstage-plugin-tekton@1.1.1) (2023-04-19)

### Bug Fixes

- **tekton:** updates pf react-topology to standalone release ([#263](https://github.com/janus-idp/backstage-plugins/issues/263)) ([e739463](https://github.com/janus-idp/backstage-plugins/commit/e73946309fecfb3785419cf3543feefff4f54111))

## @janus-idp/backstage-plugin-tekton [1.1.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-tekton@1.0.0...@janus-idp/backstage-plugin-tekton@1.1.0) (2023-04-17)

### Features

- **tekton:** tekton pipeline run list page ([#236](https://github.com/janus-idp/backstage-plugins/issues/236)) ([864941f](https://github.com/janus-idp/backstage-plugins/commit/864941f96a0a733dc20914cc6127c39a9e3ebfb2))

## @janus-idp/backstage-plugin-tekton 1.0.0 (2023-04-03)

### Features

- **tekton:** tekton plugin init with backstage k8s plugin ([#214](https://github.com/janus-idp/backstage-plugins/issues/214)) ([eb2f6d8](https://github.com/janus-idp/backstage-plugins/commit/eb2f6d8dd3056e9be84051dbb8bba09de1455eb2))
