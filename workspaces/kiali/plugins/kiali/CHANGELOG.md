### Dependencies

## 1.39.1

### Patch Changes

- e4f6d5f: Updated dependency `cytoscape` to `3.32.0`.
- 5d0701f: Updated dependency `cytoscape` to `3.32.1`.

## 1.39.0

### Minor Changes

- cdad6af: Create kiali-react component library

### Patch Changes

- 6a59fcf: remove support and lifecycle keywords in package.json
- e958f2f: Updated dependency `@types/node` to `22.15.29`.
- 7d6d70f: Updated dependency `start-server-and-test` to `2.0.12`.
- fcc57ec: Updated dependency `@types/node` to `22.14.1`.
- Updated dependencies [9e58717]
  - @backstage-community/plugin-kiali-react@0.1.1

## 1.38.0

### Minor Changes

- 8cb76ee: Migrate types to kiali-common
- fe9f230: Fix provider selector
- e53d4ba: Create a common library

### Patch Changes

- 29fb22e: remove unused dependency `@playwright/test`
- Updated dependencies [8cb76ee]
  - @backstage-community/plugin-kiali-common@0.2.0

## 1.37.0

### Minor Changes

- f181693: Support kiali > 1.86
- a428c5d: Upgrade backstage to version 1.38.1

### Patch Changes

- c31699d: Updated dependency `@playwright/test` to `1.51.1`.
- d170116: Updated dependency `canvas` to `^3.0.0`.
- 44ec099: Updated dependency `cytoscape` to `3.31.2`.
- f16f56e: Updated dependency `start-server-and-test` to `2.0.11`.
- 0d59491: Updated dependency `@patternfly/react-topology` to `5.4.1`.
- f84ad73: chore: remove homepage field from package.json

## 1.36.4

### Patch Changes

- c222ea4: Updated dependency `@playwright/test` to `1.51.0`.

## 1.36.3

### Patch Changes

- a4149db: Updated dependency `micro-memoize` to `4.1.3`.
- 3e35324: Updated dependency `start-server-and-test` to `2.0.10`.

## 1.36.2

### Patch Changes

- 0b73ce1: Upgrade backstage to 1.35.0 and remove @spotify/prettier-config

## 1.36.1

### Patch Changes

- 06a5884: Updated dependency `@types/node` to `22.10.5`.

## 1.36.0

### Minor Changes

- 117f8e0: Support multi providers in Kiali

## 1.35.1

### Patch Changes

- 59cab9a: The `kiali` and `kiali-backend` plugins from the [janus-idp/backstage-plugins](https://github.com/janus-idp/backstage-plugins) repository were migrated to the community plugins, based on commit [92a16c5](https://github.com/janus-idp/backstage-plugins/commit/92a16c5). The migration was performed by following the manual migration steps outlined in the [Community Plugins CONTRIBUTING guide](https://github.com/backstage/community-plugins/blob/main/CONTRIBUTING.md#migrating-a-plugin)

## 1.35.0

### Minor Changes

- 9671df5: Bump plugins/kiali to 1.35.0 in main branch, in prep for release of 1.4.0

## 1.34.1

### Patch Changes

- 0e6bfd3: feat: update Backstage to the latest version

  Update to Backstage 1.32.5

## 1.34.0

### Minor Changes

- 8244f28: chore(deps): update to backstage 1.32

## 1.33.1

### Patch Changes

- 7342e9b: chore: remove @janus-idp/cli dep and relink local packages

  This update removes `@janus-idp/cli` from all plugins, as it’s no longer necessary. Additionally, packages are now correctly linked with a specified version.

## 1.33.0

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

## @backstage-community/plugin-kiali [1.30.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.29.0...@backstage-community/plugin-kiali@1.30.0) (2024-07-30)

### Features

- **kiali:** traffic graph ([#1606](https://github.com/janus-idp/backstage-plugins/issues/1606)) ([657fef9](https://github.com/janus-idp/backstage-plugins/commit/657fef97d73e8ba2ad6a3e0c5bc95379f802aa69))

## @backstage-community/plugin-kiali [1.29.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.28.0...@backstage-community/plugin-kiali@1.29.0) (2024-07-26)

### Features

- **deps:** update to backstage 1.29 ([#1900](https://github.com/janus-idp/backstage-plugins/issues/1900)) ([f53677f](https://github.com/janus-idp/backstage-plugins/commit/f53677fb02d6df43a9de98c43a9f101a6db76802))

## @backstage-community/plugin-kiali [1.28.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.27.0...@backstage-community/plugin-kiali@1.28.0) (2024-07-24)

### Features

- **deps:** update to backstage 1.28 ([#1891](https://github.com/janus-idp/backstage-plugins/issues/1891)) ([1ba1108](https://github.com/janus-idp/backstage-plugins/commit/1ba11088e0de60e90d138944267b83600dc446e5))

## @backstage-community/plugin-kiali [1.27.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.26.0...@backstage-community/plugin-kiali@1.27.0) (2024-07-17)

### Features

- **kiali:** sticky headers for tables ([#1877](https://github.com/janus-idp/backstage-plugins/issues/1877)) ([64578d9](https://github.com/janus-idp/backstage-plugins/commit/64578d9c409d5e0d5ed58a93d911ecfe29587679))

## @backstage-community/plugin-kiali [1.26.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.25.0...@backstage-community/plugin-kiali@1.26.0) (2024-07-10)

### Features

- **kiali:** revert changes to Kiali 1.86 ([#1839](https://github.com/janus-idp/backstage-plugins/issues/1839)) ([#1876](https://github.com/janus-idp/backstage-plugins/issues/1876)) ([c512b29](https://github.com/janus-idp/backstage-plugins/commit/c512b298e028d371cb8d22260cdd707e1f5b1ff7))

## @backstage-community/plugin-kiali [1.25.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.24.1...@backstage-community/plugin-kiali@1.25.0) (2024-07-09)

### Features

- **kiali:** improve styles ([#1861](https://github.com/janus-idp/backstage-plugins/issues/1861)) ([158800f](https://github.com/janus-idp/backstage-plugins/commit/158800fc3f59a4901ea43c7cc00695a6bfb86ca8))

## @backstage-community/plugin-kiali [1.24.1](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.24.0...@backstage-community/plugin-kiali@1.24.1) (2024-07-08)

### Bug Fixes

- **kiali:** add bearer token ([#1870](https://github.com/janus-idp/backstage-plugins/issues/1870)) ([8875276](https://github.com/janus-idp/backstage-plugins/commit/8875276d8f836111462161ef4a6e0caae9209409))

## @backstage-community/plugin-kiali [1.24.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.23.0...@backstage-community/plugin-kiali@1.24.0) (2024-06-28)

### Features

- **kiali:** changes to Kiali 1.86 ([#1839](https://github.com/janus-idp/backstage-plugins/issues/1839)) ([ab1f6bc](https://github.com/janus-idp/backstage-plugins/commit/ab1f6bcb0a803406c96ea944701e5efa94c9cbcf))

## @backstage-community/plugin-kiali [1.23.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.22.0...@backstage-community/plugin-kiali@1.23.0) (2024-06-26)

### Features

- **kiali:** add tests for the overview page ([#1790](https://github.com/janus-idp/backstage-plugins/issues/1790)) ([582cf36](https://github.com/janus-idp/backstage-plugins/commit/582cf36da48f21f7aa31075430bf566a818a3cfa))

## @backstage-community/plugin-kiali [1.22.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.21.0...@backstage-community/plugin-kiali@1.22.0) (2024-06-24)

### Features

- **kiali:** include Kiali external URL as a parameter ([#1835](https://github.com/janus-idp/backstage-plugins/issues/1835)) ([6dbe9eb](https://github.com/janus-idp/backstage-plugins/commit/6dbe9eb6cd635f682da6b893aad8bcd8ad2fb170))

## @backstage-community/plugin-kiali [1.21.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.20.0...@backstage-community/plugin-kiali@1.21.0) (2024-06-21)

### Features

- **kiali:** add banner to warn for tech preview windows ([#1829](https://github.com/janus-idp/backstage-plugins/issues/1829)) ([b0cb796](https://github.com/janus-idp/backstage-plugins/commit/b0cb7960b572dd17ec001a1afcb314219a45e656))

## @backstage-community/plugin-kiali [1.20.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.19.2...@backstage-community/plugin-kiali@1.20.0) (2024-06-20)

### Features

- **kiali:** resources card test coverage ([#1821](https://github.com/janus-idp/backstage-plugins/issues/1821)) ([4090fc2](https://github.com/janus-idp/backstage-plugins/commit/4090fc2e0a20db31fb08fc262dd290a67bd7b05e))

## @backstage-community/plugin-kiali [1.19.2](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.19.1...@backstage-community/plugin-kiali@1.19.2) (2024-06-19)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.11.1

## @backstage-community/plugin-kiali [1.19.1](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.19.0...@backstage-community/plugin-kiali@1.19.1) (2024-06-14)

## @backstage-community/plugin-kiali [1.19.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.18.14...@backstage-community/plugin-kiali@1.19.0) (2024-06-13)

### Features

- **deps:** update to backstage 1.27 ([#1683](https://github.com/janus-idp/backstage-plugins/issues/1683)) ([a14869c](https://github.com/janus-idp/backstage-plugins/commit/a14869c3f4177049cb8d6552b36c3ffd17e7997d))

### Dependencies

- **@janus-idp/cli:** upgraded to 1.11.0

## @backstage-community/plugin-kiali [1.18.14](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.18.13...@backstage-community/plugin-kiali@1.18.14) (2024-06-13)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.10.1

## @backstage-community/plugin-kiali [1.18.13](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.18.12...@backstage-community/plugin-kiali@1.18.13) (2024-06-10)

### Bug Fixes

- **kiali:** fix dev links ([#1801](https://github.com/janus-idp/backstage-plugins/issues/1801)) ([2a86a5e](https://github.com/janus-idp/backstage-plugins/commit/2a86a5e7ed43c520962f32a11bc1cce6d13523e3))

## @backstage-community/plugin-kiali [1.18.12](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.18.11...@backstage-community/plugin-kiali@1.18.12) (2024-06-06)

### Bug Fixes

- **kiali:** remove debug window ([#1793](https://github.com/janus-idp/backstage-plugins/issues/1793)) ([b5b5376](https://github.com/janus-idp/backstage-plugins/commit/b5b5376181d49074bd58bb34734561eab6ee8d2a))

## @backstage-community/plugin-kiali [1.18.11](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.18.10...@backstage-community/plugin-kiali@1.18.11) (2024-06-06)

### Documentation

- **kiali:** update development doc for alpha backend([#1720](https://github.com/janus-idp/backstage-plugins/issues/1720)) ([e06e9be](https://github.com/janus-idp/backstage-plugins/commit/e06e9bee0745e76beccb8d7e3810548fd46207db))

## @backstage-community/plugin-kiali [1.18.10](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.18.9...@backstage-community/plugin-kiali@1.18.10) (2024-06-06)

### Bug Fixes

- **kiali:** sanitize input for CWE-79 ([#1786](https://github.com/janus-idp/backstage-plugins/issues/1786)) ([9ba95bb](https://github.com/janus-idp/backstage-plugins/commit/9ba95bba7b9d5081829831e797b27f6a286971a4))

## @backstage-community/plugin-kiali [1.18.9](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.18.8...@backstage-community/plugin-kiali@1.18.9) (2024-06-05)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.10.0

## @backstage-community/plugin-kiali [1.18.8](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.18.7...@backstage-community/plugin-kiali@1.18.8) (2024-06-04)

## @backstage-community/plugin-kiali [1.18.7](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.18.6...@backstage-community/plugin-kiali@1.18.7) (2024-06-04)

### Bug Fixes

- **deps:** update kiali dependencies (minor) ([#1779](https://github.com/janus-idp/backstage-plugins/issues/1779)) ([ff2b421](https://github.com/janus-idp/backstage-plugins/commit/ff2b421be9206d395805f497d4e2821ca4d6edc1))

## @backstage-community/plugin-kiali [1.18.6](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.18.5...@backstage-community/plugin-kiali@1.18.6) (2024-06-03)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.9.0

## @backstage-community/plugin-kiali [1.18.5](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.18.4...@backstage-community/plugin-kiali@1.18.5) (2024-05-31)

## @backstage-community/plugin-kiali [1.18.4](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.18.3...@backstage-community/plugin-kiali@1.18.4) (2024-05-31)

## @backstage-community/plugin-kiali [1.18.3](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.18.2...@backstage-community/plugin-kiali@1.18.3) (2024-05-29)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.8.10

## @backstage-community/plugin-kiali [1.18.2](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.18.1...@backstage-community/plugin-kiali@1.18.2) (2024-05-29)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.8.9

## @backstage-community/plugin-kiali [1.18.1](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.18.0...@backstage-community/plugin-kiali@1.18.1) (2024-05-16)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.8.7

## @backstage-community/plugin-kiali [1.18.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.17.3...@backstage-community/plugin-kiali@1.18.0) (2024-05-14)

### Features

- **deps:** use RHDH themes in the backstage app and dev pages ([#1480](https://github.com/janus-idp/backstage-plugins/issues/1480)) ([8263bf0](https://github.com/janus-idp/backstage-plugins/commit/8263bf099736cbb0d0f2316082d338ba81fa6927))

## @backstage-community/plugin-kiali [1.17.3](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.17.2...@backstage-community/plugin-kiali@1.17.3) (2024-05-13)

### Bug Fixes

- **kiali:** removing unnecessary afterAll hook ([#1642](https://github.com/janus-idp/backstage-plugins/issues/1642)) ([a314607](https://github.com/janus-idp/backstage-plugins/commit/a3146073bebb17b6f990891a277323a19e3731d6))

## @backstage-community/plugin-kiali [1.17.2](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.17.1...@backstage-community/plugin-kiali@1.17.2) (2024-05-09)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.8.6

## @backstage-community/plugin-kiali [1.17.1](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.17.0...@backstage-community/plugin-kiali@1.17.1) (2024-05-08)

### Documentation

- **kiali:** update rhdh docs ([#1621](https://github.com/janus-idp/backstage-plugins/issues/1621)) ([7087cba](https://github.com/janus-idp/backstage-plugins/commit/7087cbad8929708f065e0027871a337946f09881))

## @backstage-community/plugin-kiali [1.17.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.16.10...@backstage-community/plugin-kiali@1.17.0) (2024-05-07)

### Features

- **kiali:** add card for resources ([#1565](https://github.com/janus-idp/backstage-plugins/issues/1565)) ([1e727aa](https://github.com/janus-idp/backstage-plugins/commit/1e727aae0464aa55e4dce754a04e97a5708c07f9))

## @backstage-community/plugin-kiali [1.16.10](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.16.9...@backstage-community/plugin-kiali@1.16.10) (2024-05-04)

### Bug Fixes

- **kiali:** remove IstioConfig extra, Fix links and add kiali control ([#1452](https://github.com/janus-idp/backstage-plugins/issues/1452)) ([51a35f0](https://github.com/janus-idp/backstage-plugins/commit/51a35f0ccee8a38555079b2fa6027639ee595f9b))

## @backstage-community/plugin-kiali [1.16.9](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.16.8...@backstage-community/plugin-kiali@1.16.9) (2024-05-02)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.8.5

## @backstage-community/plugin-kiali [1.16.8](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.16.7...@backstage-community/plugin-kiali@1.16.8) (2024-05-02)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.8.4

## @backstage-community/plugin-kiali [1.16.7](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.16.6...@backstage-community/plugin-kiali@1.16.7) (2024-04-30)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.8.3

## @backstage-community/plugin-kiali [1.16.6](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.16.5...@backstage-community/plugin-kiali@1.16.6) (2024-04-30)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.8.2

## @backstage-community/plugin-kiali [1.16.5](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.16.4...@backstage-community/plugin-kiali@1.16.5) (2024-04-25)

### Bug Fixes

- **kiali:** update load for overview page ([#1491](https://github.com/janus-idp/backstage-plugins/issues/1491)) ([8de16e2](https://github.com/janus-idp/backstage-plugins/commit/8de16e2f08f2f02ad8001a21d7ec0511ba965a86))

### Dependencies

- **@janus-idp/cli:** upgraded to 1.8.1

## @backstage-community/plugin-kiali [1.16.4](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.16.3...@backstage-community/plugin-kiali@1.16.4) (2024-04-15)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.8.0

## @backstage-community/plugin-kiali [1.16.3](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.16.2...@backstage-community/plugin-kiali@1.16.3) (2024-04-09)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.7.10

## @backstage-community/plugin-kiali [1.16.2](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.16.1...@backstage-community/plugin-kiali@1.16.2) (2024-04-09)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.7.9

## @backstage-community/plugin-kiali [1.16.1](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.16.0...@backstage-community/plugin-kiali@1.16.1) (2024-04-05)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.7.8

## @backstage-community/plugin-kiali [1.16.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.15.0...@backstage-community/plugin-kiali@1.16.0) (2024-04-04)

### Features

- **kiali:** istio config list and details ([#1326](https://github.com/janus-idp/backstage-plugins/issues/1326)) ([f8fc349](https://github.com/janus-idp/backstage-plugins/commit/f8fc349e1305b10632520c4f25f78c45b54481bb))

## @backstage-community/plugin-kiali [1.15.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.14.2...@backstage-community/plugin-kiali@1.15.0) (2024-04-03)

### Features

- **kiali:** update dark theme ([#1434](https://github.com/janus-idp/backstage-plugins/issues/1434)) ([e0d84e1](https://github.com/janus-idp/backstage-plugins/commit/e0d84e177786187e0d7a8b279d7e72f710207d91))

## @backstage-community/plugin-kiali [1.14.2](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.14.1...@backstage-community/plugin-kiali@1.14.2) (2024-04-02)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.7.7

## @backstage-community/plugin-kiali [1.14.1](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.14.0...@backstage-community/plugin-kiali@1.14.1) (2024-03-29)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.7.6

## @backstage-community/plugin-kiali [1.14.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.13.0...@backstage-community/plugin-kiali@1.14.0) (2024-03-25)

### Features

- **kiali:** metrics tab ([#1331](https://github.com/janus-idp/backstage-plugins/issues/1331)) ([d80e331](https://github.com/janus-idp/backstage-plugins/commit/d80e33155481730c0e95de40da99ed0280e982c8))

## @backstage-community/plugin-kiali [1.13.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.12.1...@backstage-community/plugin-kiali@1.13.0) (2024-03-14)

### Features

- **kiali:** include a new List entity view ([#1316](https://github.com/janus-idp/backstage-plugins/issues/1316)) ([f4d5e70](https://github.com/janus-idp/backstage-plugins/commit/f4d5e70ed98ceaf6277402f39feb26bd114d0d6b))

## @backstage-community/plugin-kiali [1.12.1](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.12.0...@backstage-community/plugin-kiali@1.12.1) (2024-03-11)

### Documentation

- **kiali:** minor update in development docs ([#820](https://github.com/janus-idp/backstage-plugins/issues/820)) ([81e79bf](https://github.com/janus-idp/backstage-plugins/commit/81e79bf59ebff745a8775dc9ac784c7889e9532c))

## @backstage-community/plugin-kiali [1.12.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.11.3...@backstage-community/plugin-kiali@1.12.0) (2024-03-06)

### Features

- **kiali:** services and apps list and details overview ([#1276](https://github.com/janus-idp/backstage-plugins/issues/1276)) ([7e4c0a5](https://github.com/janus-idp/backstage-plugins/commit/7e4c0a5fd699b42def7989155bfc377a670575db))

## @backstage-community/plugin-kiali [1.11.3](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.11.2...@backstage-community/plugin-kiali@1.11.3) (2024-03-04)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.7.5

## @backstage-community/plugin-kiali [1.11.2](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.11.1...@backstage-community/plugin-kiali@1.11.2) (2024-02-27)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.7.4

## @backstage-community/plugin-kiali [1.11.1](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.11.0...@backstage-community/plugin-kiali@1.11.1) (2024-02-26)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.7.3

## @backstage-community/plugin-kiali [1.11.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.10.2...@backstage-community/plugin-kiali@1.11.0) (2024-02-21)

### Features

- **kiali:** workloads details page overview tab ([#1198](https://github.com/janus-idp/backstage-plugins/issues/1198)) ([34adc57](https://github.com/janus-idp/backstage-plugins/commit/34adc57837406e80b93a1a1657e96ff902bf24bd))

### Dependencies

- **@janus-idp/cli:** upgraded to 1.7.2

## @backstage-community/plugin-kiali [1.10.2](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.10.1...@backstage-community/plugin-kiali@1.10.2) (2024-02-19)

### Bug Fixes

- **kiali:** update styles, remove item details links ([#1207](https://github.com/janus-idp/backstage-plugins/issues/1207)) ([c133ea7](https://github.com/janus-idp/backstage-plugins/commit/c133ea76772b44ec348c5bff3ad4609f1938fdba))

## @backstage-community/plugin-kiali [1.10.1](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.10.0...@backstage-community/plugin-kiali@1.10.1) (2024-02-14)

### Bug Fixes

- **kiali:** add corner cases, fix some issues and improve dev env ([#1202](https://github.com/janus-idp/backstage-plugins/issues/1202)) ([fd9a8aa](https://github.com/janus-idp/backstage-plugins/commit/fd9a8aaae4aa7f625bbfdac954e2580d0dc0e30f))

## @backstage-community/plugin-kiali [1.10.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.9.1...@backstage-community/plugin-kiali@1.10.0) (2024-02-12)

### Features

- **kiali:** workloads page list ([#1129](https://github.com/janus-idp/backstage-plugins/issues/1129)) ([1e3991b](https://github.com/janus-idp/backstage-plugins/commit/1e3991b9af35ef5da8f9987fc2d17026d438a853))

## @backstage-community/plugin-kiali [1.9.1](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.9.0...@backstage-community/plugin-kiali@1.9.1) (2024-02-08)

### Bug Fixes

- **kiali:** namespaceSelector is removing options ([#1186](https://github.com/janus-idp/backstage-plugins/issues/1186)) ([0195b06](https://github.com/janus-idp/backstage-plugins/commit/0195b06158327649afb298715ceab9fc0e89a07b))

## @backstage-community/plugin-kiali [1.9.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.8.5...@backstage-community/plugin-kiali@1.9.0) (2024-02-07)

### Features

- **kiali:** add KialiPage Component ([#1180](https://github.com/janus-idp/backstage-plugins/issues/1180)) ([c91bcc3](https://github.com/janus-idp/backstage-plugins/commit/c91bcc3bc13b274312de3d0656d8ea865a3af27b))

## @backstage-community/plugin-kiali [1.8.5](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.8.4...@backstage-community/plugin-kiali@1.8.5) (2024-02-05)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.7.1

## @backstage-community/plugin-kiali [1.8.4](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.8.3...@backstage-community/plugin-kiali@1.8.4) (2024-01-31)

### Bug Fixes

- **kiali:** show username when auth is anonymous ([#1139](https://github.com/janus-idp/backstage-plugins/issues/1139)) ([0a04992](https://github.com/janus-idp/backstage-plugins/commit/0a04992b0581a3cb47017c0713703ed7e204ac02))

## @backstage-community/plugin-kiali [1.8.3](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.8.2...@backstage-community/plugin-kiali@1.8.3) (2024-01-30)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.7.0

## @backstage-community/plugin-kiali [1.8.2](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.8.1...@backstage-community/plugin-kiali@1.8.2) (2024-01-25)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.6.0

## @backstage-community/plugin-kiali [1.8.1](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.8.0...@backstage-community/plugin-kiali@1.8.1) (2024-01-24)

### Bug Fixes

- **kiali:** fix sessionTime configuration and tests ([#1099](https://github.com/janus-idp/backstage-plugins/issues/1099)) ([882381c](https://github.com/janus-idp/backstage-plugins/commit/882381c0b65a2bcfecc2365048f83376938a0fb8)), closes [#1100](https://github.com/janus-idp/backstage-plugins/issues/1100)

## @backstage-community/plugin-kiali [1.8.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.7.0...@backstage-community/plugin-kiali@1.8.0) (2024-01-19)

### Other changes

- **kiali:** add context, remove kiali-common and refactor backend ([#855](https://github.com/janus-idp/backstage-plugins/issues/855)) ([54c7001](https://github.com/janus-idp/backstage-plugins/commit/54c70018d948912d36a4949bbaf1633763fb9ae1))

## @backstage-community/plugin-kiali [1.7.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.6.13...@backstage-community/plugin-kiali@1.7.0) (2024-01-18)

### Features

- **kiali:** add OWNERS file to kiali\* plugin ([#1082](https://github.com/janus-idp/backstage-plugins/issues/1082)) ([e2dc23b](https://github.com/janus-idp/backstage-plugins/commit/e2dc23b9db3da0384137e809795a57da118e494d))

## @backstage-community/plugin-kiali [1.6.13](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.6.12...@backstage-community/plugin-kiali@1.6.13) (2024-01-16)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.5.0

## @backstage-community/plugin-kiali [1.6.12](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.6.11...@backstage-community/plugin-kiali@1.6.12) (2023-12-07)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.4.7

## @backstage-community/plugin-kiali [1.6.11](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.6.10...@backstage-community/plugin-kiali@1.6.11) (2023-11-30)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.4.6

## @backstage-community/plugin-kiali [1.6.10](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.6.9...@backstage-community/plugin-kiali@1.6.10) (2023-11-22)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.4.5

## @backstage-community/plugin-kiali [1.6.9](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.6.8...@backstage-community/plugin-kiali@1.6.9) (2023-11-21)

### Bug Fixes

- sync versions in dynamic assets and publish derived packages as additional packages ([#963](https://github.com/janus-idp/backstage-plugins/issues/963)) ([7d0a386](https://github.com/janus-idp/backstage-plugins/commit/7d0a38609b4a18b54c75378a150e8b5c3ba8ff43))

## @backstage-community/plugin-kiali [1.6.8](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.6.7...@backstage-community/plugin-kiali@1.6.8) (2023-11-20)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.4.4

## @backstage-community/plugin-kiali [1.6.7](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.6.6...@backstage-community/plugin-kiali@1.6.7) (2023-11-16)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.4.3

## @backstage-community/plugin-kiali [1.6.6](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.6.5...@backstage-community/plugin-kiali@1.6.6) (2023-11-13)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.4.2

## @backstage-community/plugin-kiali [1.6.5](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.6.4...@backstage-community/plugin-kiali@1.6.5) (2023-11-13)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.4.1

## @backstage-community/plugin-kiali [1.6.4](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.6.3...@backstage-community/plugin-kiali@1.6.4) (2023-11-07)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.4.0

## @backstage-community/plugin-kiali [1.6.3](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.6.2...@backstage-community/plugin-kiali@1.6.3) (2023-11-06)

### Bug Fixes

- **cli:** add default scalprum config ([#909](https://github.com/janus-idp/backstage-plugins/issues/909)) ([d74fc72](https://github.com/janus-idp/backstage-plugins/commit/d74fc72ab7e0a843da047c7b6570d8a6fbc068e1))

### Dependencies

- **@janus-idp/cli:** upgraded to 1.3.3

## @backstage-community/plugin-kiali [1.6.2](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.6.1...@backstage-community/plugin-kiali@1.6.2) (2023-11-06)

### Documentation

- update frontend plugin docs to use EntityLayout instead of EntityPageLayout ([#907](https://github.com/janus-idp/backstage-plugins/issues/907)) ([aa91bba](https://github.com/janus-idp/backstage-plugins/commit/aa91bba4c7a43de416258eb019724e21c7cf4bb8))

## @backstage-community/plugin-kiali [1.6.1](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.6.0...@backstage-community/plugin-kiali@1.6.1) (2023-11-02)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.3.2

## @backstage-community/plugin-kiali [1.6.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.5.5...@backstage-community/plugin-kiali@1.6.0) (2023-11-01)

### Features

- **dynamic-plugins:** publish dynamic assets for all frontend plugins ([#896](https://github.com/janus-idp/backstage-plugins/issues/896)) ([dcfb0ac](https://github.com/janus-idp/backstage-plugins/commit/dcfb0ac56769c82f6b8b2cef2726251e0b60c375))

## @backstage-community/plugin-kiali [1.5.5](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.5.4...@backstage-community/plugin-kiali@1.5.5) (2023-10-27)

### Dependencies

- **@backstage-community/plugin-kiali-common:** upgraded to 1.0.0

## @backstage-community/plugin-kiali [1.5.4](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.5.3...@backstage-community/plugin-kiali@1.5.4) (2023-10-25)

### Bug Fixes

- **kiali:** use prevState callback ([#874](https://github.com/janus-idp/backstage-plugins/issues/874)) ([13a01f7](https://github.com/janus-idp/backstage-plugins/commit/13a01f79be812fe74f71f474152c7e8fe0f4fe90))

## @backstage-community/plugin-kiali [1.5.3](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.5.2...@backstage-community/plugin-kiali@1.5.3) (2023-10-19)

### Dependencies

- **@backstage-community/plugin-kiali-common:** upgraded to 1.4.1

## @backstage-community/plugin-kiali [1.5.2](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.5.1...@backstage-community/plugin-kiali@1.5.2) (2023-09-22)

## @backstage-community/plugin-kiali [1.5.1](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.5.0...@backstage-community/plugin-kiali@1.5.1) (2023-09-11)

## @backstage-community/plugin-kiali [1.5.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.4.0...@backstage-community/plugin-kiali@1.5.0) (2023-08-30)

### Features

- **kiali:** add namespace selector ([#675](https://github.com/janus-idp/backstage-plugins/issues/675)) ([e3cfc26](https://github.com/janus-idp/backstage-plugins/commit/e3cfc26bdf550916da3ee801601196d8614471b5))

### Dependencies

- **@backstage-community/plugin-kiali-common:** upgraded to 1.4.0

## @backstage-community/plugin-kiali [1.4.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.3.1...@backstage-community/plugin-kiali@1.4.0) (2023-08-29)

### Features

- **kiali:** frontend dev environment ([#687](https://github.com/janus-idp/backstage-plugins/issues/687)) ([c4f4ddd](https://github.com/janus-idp/backstage-plugins/commit/c4f4dddd1f2b6ba5b908bbf1a5f88dc9d54b93e5))

## @backstage-community/plugin-kiali [1.3.1](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.3.0...@backstage-community/plugin-kiali@1.3.1) (2023-08-29)

### Bug Fixes

- **kiali:** upgrade patternfly ([#673](https://github.com/janus-idp/backstage-plugins/issues/673)) ([6e5702f](https://github.com/janus-idp/backstage-plugins/commit/6e5702f196c2fbf8de888ca5083241a58548469e))

## @backstage-community/plugin-kiali [1.3.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.2.1...@backstage-community/plugin-kiali@1.3.0) (2023-08-28)

### Features

- **kiali:** show kiali information in header ([#630](https://github.com/janus-idp/backstage-plugins/issues/630)) ([b9a83b3](https://github.com/janus-idp/backstage-plugins/commit/b9a83b332ec518e60a9780961fdce070eda02d02))

### Dependencies

- **@backstage-community/plugin-kiali-common:** upgraded to 1.3.0

## @backstage-community/plugin-kiali [1.2.1](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.2.0...@backstage-community/plugin-kiali@1.2.1) (2023-08-22)

### Bug Fixes

- **kiali:** fix code smells ([#607](https://github.com/janus-idp/backstage-plugins/issues/607)) ([ef2eecf](https://github.com/janus-idp/backstage-plugins/commit/ef2eecfa71e2a60b4442ce3105a526b3332eaa1b))

### Dependencies

- **@backstage-community/plugin-kiali-common:** upgraded to 1.2.1

## @backstage-community/plugin-kiali [1.2.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.1.0...@backstage-community/plugin-kiali@1.2.0) (2023-08-14)

### Features

- **ts:** transpile each plugin separately ([#634](https://github.com/janus-idp/backstage-plugins/issues/634)) ([b94c4dc](https://github.com/janus-idp/backstage-plugins/commit/b94c4dc50ada328e5ce1bed5fb7c76f64607e1ee))

### Dependencies

- **@backstage-community/plugin-kiali-common:** upgraded to 1.2.0

## @backstage-community/plugin-kiali [1.1.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.0.3...@backstage-community/plugin-kiali@1.1.0) (2023-07-27)

### Features

- **kiali:** move from node-fetch to axios ([#573](https://github.com/janus-idp/backstage-plugins/issues/573)) ([c0ed797](https://github.com/janus-idp/backstage-plugins/commit/c0ed7972ef8fa143d51b590ca5f874900e5d8bef))

### Dependencies

- **@backstage-community/plugin-kiali-common:** upgraded to 1.1.0

## @backstage-community/plugin-kiali [1.0.3](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.0.2...@backstage-community/plugin-kiali@1.0.3) (2023-07-25)

## @backstage-community/plugin-kiali [1.0.2](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.0.1...@backstage-community/plugin-kiali@1.0.2) (2023-07-25)

## @backstage-community/plugin-kiali [1.0.1](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-kiali@1.0.0...@backstage-community/plugin-kiali@1.0.1) (2023-07-25)

## @backstage-community/plugin-kiali 1.0.0 (2023-07-25)

### Features

- **kiali:** kiali plugin ([#371](https://github.com/janus-idp/backstage-plugins/issues/371)) ([08d5583](https://github.com/janus-idp/backstage-plugins/commit/08d5583f839a8233d7b08a7ec1eb043bf4978e91))

### Dependencies

- **@backstage-community/plugin-kiali-common:** upgraded to 1.0.0
