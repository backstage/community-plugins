## @backstage-community/plugin-redhat-argocd

## 1.10.4

### Patch Changes

- a6e850f: Updated dependency `msw` to `1.3.5`.

## 1.10.3

### Patch Changes

- d1cae81: Removed `export-dynamic` script and Janus IDP cli from the build process and npm release.

## 1.10.2

### Patch Changes

- a83d499: Bumping the @janus-cli/shared-react dependency to ^2.13.0

## 1.10.1

### Patch Changes

- 9e73efd: redhat-argocd: release 1.8.9 as 1.10.1

## 1.10.0

### Minor Changes

- 1684b7aa: redhat-argocd: release 1.8.8 as 1.10.0

## 1.9.1

### Patch Changes

- b8a5ccf5: redhat-argocd: release 1.8.7 as 1.9.1

## 1.9.0

### Minor Changes

- d2c0e4d0: redhat-argocd: release 1.8.6 as 1.9.0

## 1.8.10

### Patch Changes

- 2b7826d6: fix(deps): upgrade kubernetes/client-node in argocd plugin

## 1.8.9

### Patch Changes

- ef55b90: Updated reference to `@backstage-community/plugin-redhat-argocd-common` in the frontend plugin to use the `workspace:^` version

## 1.8.8

### Patch Changes

- ccc01a0: Backstage version bump to v1.32.2
- Updated dependencies [ccc01a0]
  - @backstage-community/plugin-redhat-argocd-common@1.0.7

## 1.8.7

### Patch Changes

- 3865528: Fix CVE by upgrading kubernetes/client-node to v0.22.1

## 1.8.6

### Patch Changes

- a1313aa: Backstage version bump to v1.31.2
- Updated dependencies [a1313aa]
  - @backstage-community/plugin-redhat-argocd-common@1.0.6

## 1.8.5

### Patch Changes

- c829b80: fetched argo resources timestamp from k8s object

## 1.8.4

### Patch Changes

- 7aa4847: add dynamic plugin assets in argocd package

## 1.8.3

### Patch Changes

- 1f5881c: update sidebar filters for argocd plugin

## 1.8.2

### Patch Changes

- b393cbc: Redesign argocd sidebar layout

## 1.8.1

### Patch Changes

- 7dc8618: Updated dependency `@redhat-developer/red-hat-developer-hub-theme` to `0.2.0`.

## 1.8.0

### Minor Changes

- 2687d9a: Displaying list of resources managed by ArgoCD in the application sidebar

## 1.7.0

### Minor Changes

- 9dc17ff: Add argo rollouts information in the application sidebar

## 1.6.9

### Patch Changes

- 38d858e: regen yarn.lock
- 4431964: fix version range for dependency @backstage-community/plugin-redhat-argocd-common so we can bump to 1.0.4 without the tests failing at https://github.com/backstage/community-plugins/actions/runs/10603150719/job/29386810871?pr=1114
- Updated dependencies [38d858e]
  - @backstage-community/plugin-redhat-argocd-common@1.0.5

## 1.6.8

### Patch Changes

- 576a2d1: chore: update supported-versions to 1.29.2
- Updated dependencies [576a2d1]
  - @backstage-community/plugin-redhat-argocd-common@1.0.4

## 1.6.7

### Patch Changes

- 2436cfa: update link to dynamic plugin info

## 1.6.6

### Patch Changes

- 09499f2: chore: updated janus-idp namespace to backstage-community

## 1.6.5

### Patch Changes

- ed69246: Updated dependency `@janus-idp/cli` to `1.13.1`.

## 1.6.4

### Patch Changes

- aca4c41: Updated dependency `@kubernetes/client-node` to `^0.21.0`.

## 1.6.3

### Patch Changes

- 8907cb6: Backstage version bump to v1.30.2

## 1.6.2

### Patch Changes

- 9710c02: Updated dependency `@playwright/test` to `1.46.1`.

## 1.6.1

### Patch Changes

- 3b45ff6: The `argocd` and `argocd-common` plugins from the [janus-idp/backstage-plugins](https://github.com/janus-idp/backstage-plugins) repository were migrated to the community plugins, based on commit [c3232099](https://github.com/janus-idp/backstage-plugins/commit/c3232099). The migration was performed by following the manual migration steps outlined in the [Community Plugins CONTRIBUTING guide](https://github.com/backstage/community-plugins/blob/main/CONTRIBUTING.md#migrating-a-plugin)

### Dependencies

- **@janus-idp/backstage-plugin-argocd-common:** upgraded to 1.0.0

## @janus-idp/backstage-plugin-argocd [1.5.6](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-argocd@1.5.5...@janus-idp/backstage-plugin-argocd@1.5.6) (2024-08-02)

### Dependencies

- **@janus-idp/backstage-plugin-argocd-common:** upgraded to 1.0.0

## @janus-idp/backstage-plugin-argocd [1.5.5](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-argocd@1.5.4...@janus-idp/backstage-plugin-argocd@1.5.5) (2024-08-01)

### Dependencies

- **@janus-idp/backstage-plugin-argocd-common:** upgraded to 1.0.0

## @janus-idp/backstage-plugin-argocd [1.5.4](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-argocd@1.5.3...@janus-idp/backstage-plugin-argocd@1.5.4) (2024-07-31)

### Bug Fixes

- argocd dependency package version ([#1992](https://github.com/janus-idp/backstage-plugins/issues/1992)) ([e3c4419](https://github.com/janus-idp/backstage-plugins/commit/e3c4419318ea3a24f8e6369decfadd26be10ae00))

### Dependencies

- **@janus-idp/backstage-plugin-argocd-common:** upgraded to 1.0.0

## @janus-idp/backstage-plugin-argocd [1.5.3](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-argocd@1.5.2...@janus-idp/backstage-plugin-argocd@1.5.3) (2024-07-31)

### Bug Fixes

- **argocd:** fix argocd naming ([#1990](https://github.com/janus-idp/backstage-plugins/issues/1990)) ([6b764a8](https://github.com/janus-idp/backstage-plugins/commit/6b764a8105811475c1d71ea2f78077d1b6b6e6d8))

### Dependencies

- **@janus-idp/backstage-plugin-argocd-common:** upgraded to 1.0.0

## @janus-idp/backstage-plugin-argocd [1.5.2](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-argocd@1.5.1...@janus-idp/backstage-plugin-argocd@1.5.2) (2024-07-31)

### Bug Fixes

- **argocd:** fix argocd-common plugin version ([#1987](https://github.com/janus-idp/backstage-plugins/issues/1987)) ([fb441fe](https://github.com/janus-idp/backstage-plugins/commit/fb441fe637137da08dc7388dbd75e58c775e01ea))

### Dependencies

- **@janus-idp/backstage-plugin-argocd-common:** upgraded to 1.0.0

## @janus-idp/backstage-plugin-argocd [1.5.1](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-argocd@1.5.0...@janus-idp/backstage-plugin-argocd@1.5.1) (2024-07-31)

### Dependencies

- **@janus-idp/backstage-plugin-argocd-common:** upgraded to 1.0.0

## @janus-idp/backstage-plugin-argocd [1.5.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-argocd@1.4.1...@janus-idp/backstage-plugin-argocd@1.5.0) (2024-07-30)

### Features

- **argocd:** add permission support for argocd ([#1855](https://github.com/janus-idp/backstage-plugins/issues/1855)) ([3b78237](https://github.com/janus-idp/backstage-plugins/commit/3b782377683605ea4d584c43bea14be2f435003d))

## @janus-idp/backstage-plugin-argocd [1.4.1](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-argocd@1.4.0...@janus-idp/backstage-plugin-argocd@1.4.1) (2024-07-26)

### Documentation

- **argocd:** update argocd configuration documentation ([#1875](https://github.com/janus-idp/backstage-plugins/issues/1875)) ([054ceec](https://github.com/janus-idp/backstage-plugins/commit/054ceec2bdca47e1ee251b2d882671b2c95915c6))

## @janus-idp/backstage-plugin-argocd [1.4.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-argocd@1.3.0...@janus-idp/backstage-plugin-argocd@1.4.0) (2024-07-25)

### Features

- **deps:** update to backstage 1.29 ([#1900](https://github.com/janus-idp/backstage-plugins/issues/1900)) ([f53677f](https://github.com/janus-idp/backstage-plugins/commit/f53677fb02d6df43a9de98c43a9f101a6db76802))

### Bug Fixes

- **deps:** update dependency react-use to v17.5.1 ([#1943](https://github.com/janus-idp/backstage-plugins/issues/1943)) ([0c05ad5](https://github.com/janus-idp/backstage-plugins/commit/0c05ad5cc1aef3df1d14f1ffa59933850a04ebbc))

### Dependencies

- **@janus-idp/cli:** upgraded to 1.13.0

## @janus-idp/backstage-plugin-argocd [1.3.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-argocd@1.2.4...@janus-idp/backstage-plugin-argocd@1.3.0) (2024-07-23)

### Features

- **deps:** update to backstage 1.28 ([#1891](https://github.com/janus-idp/backstage-plugins/issues/1891)) ([1ba1108](https://github.com/janus-idp/backstage-plugins/commit/1ba11088e0de60e90d138944267b83600dc446e5))

### Documentation

- fix argocd naming ([#1904](https://github.com/janus-idp/backstage-plugins/issues/1904)) ([3173d79](https://github.com/janus-idp/backstage-plugins/commit/3173d79b9b226fd994d48f27b392df7d167d4e64))

## @janus-idp/backstage-plugin-argocd [1.2.4](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-argocd@1.2.3...@janus-idp/backstage-plugin-argocd@1.2.4) (2024-07-17)

### Bug Fixes

- **argocd:** fix argocd commit message visibility ([#1874](https://github.com/janus-idp/backstage-plugins/issues/1874)) ([e558d75](https://github.com/janus-idp/backstage-plugins/commit/e558d7549c49a1821eafc9424f174c6d457ce414))

## @janus-idp/backstage-plugin-argocd [1.2.3](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-argocd@1.2.2...@janus-idp/backstage-plugin-argocd@1.2.3) (2024-06-21)

### Bug Fixes

- **argocd:** hide commit section for helm based applications ([#1834](https://github.com/janus-idp/backstage-plugins/issues/1834)) ([a86ce1e](https://github.com/janus-idp/backstage-plugins/commit/a86ce1e5237ac419eb93a9766cb8e2736ba9b8d7))

## @janus-idp/backstage-plugin-argocd [1.2.2](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-argocd@1.2.1...@janus-idp/backstage-plugin-argocd@1.2.2) (2024-06-19)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.11.1

## @janus-idp/backstage-plugin-argocd [1.2.1](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-argocd@1.2.0...@janus-idp/backstage-plugin-argocd@1.2.1) (2024-06-14)

### Bug Fixes

- **deps:** update dependency react-use to v17.5.0 ([#1780](https://github.com/janus-idp/backstage-plugins/issues/1780)) ([a25bf15](https://github.com/janus-idp/backstage-plugins/commit/a25bf15e14e9fa5a946551c5626c92f6b1f83d2f))

## @janus-idp/backstage-plugin-argocd [1.2.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-argocd@1.1.10...@janus-idp/backstage-plugin-argocd@1.2.0) (2024-06-13)

### Features

- **deps:** update to backstage 1.27 ([#1683](https://github.com/janus-idp/backstage-plugins/issues/1683)) ([a14869c](https://github.com/janus-idp/backstage-plugins/commit/a14869c3f4177049cb8d6552b36c3ffd17e7997d))

### Dependencies

- **@janus-idp/cli:** upgraded to 1.11.0

## @janus-idp/backstage-plugin-argocd [1.1.10](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-argocd@1.1.9...@janus-idp/backstage-plugin-argocd@1.1.10) (2024-06-13)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.10.1

## @janus-idp/backstage-plugin-argocd [1.1.9](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-argocd@1.1.8...@janus-idp/backstage-plugin-argocd@1.1.9) (2024-06-10)

## @janus-idp/backstage-plugin-argocd [1.1.8](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-argocd@1.1.7...@janus-idp/backstage-plugin-argocd@1.1.8) (2024-06-05)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.10.0

## @janus-idp/backstage-plugin-argocd [1.1.7](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-argocd@1.1.6...@janus-idp/backstage-plugin-argocd@1.1.7) (2024-06-04)

## @janus-idp/backstage-plugin-argocd [1.1.6](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-argocd@1.1.5...@janus-idp/backstage-plugin-argocd@1.1.6) (2024-06-03)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.9.0

## @janus-idp/backstage-plugin-argocd [1.1.5](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-argocd@1.1.4...@janus-idp/backstage-plugin-argocd@1.1.5) (2024-05-31)

## @janus-idp/backstage-plugin-argocd [1.1.4](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-argocd@1.1.3...@janus-idp/backstage-plugin-argocd@1.1.4) (2024-05-29)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.8.10

## @janus-idp/backstage-plugin-argocd [1.1.3](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-argocd@1.1.2...@janus-idp/backstage-plugin-argocd@1.1.3) (2024-05-29)

### Bug Fixes

- **release:** change problematic plugins to private ([#1738](https://github.com/janus-idp/backstage-plugins/issues/1738)) ([69176bd](https://github.com/janus-idp/backstage-plugins/commit/69176bd75ccd842a313445e096223ecc339b655b))

### Dependencies

- **@janus-idp/cli:** upgraded to 1.8.9

## @janus-idp/backstage-plugin-argocd [1.1.2](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-argocd@1.1.1...@janus-idp/backstage-plugin-argocd@1.1.2) (2024-05-28)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.8.8

## @janus-idp/backstage-plugin-argocd [1.1.1](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-argocd@1.1.0...@janus-idp/backstage-plugin-argocd@1.1.1) (2024-05-16)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.8.7

## @janus-idp/backstage-plugin-argocd [1.1.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-argocd@1.0.4...@janus-idp/backstage-plugin-argocd@1.1.0) (2024-05-14)

### Features

- **deps:** use RHDH themes in the backstage app and dev pages ([#1480](https://github.com/janus-idp/backstage-plugins/issues/1480)) ([8263bf0](https://github.com/janus-idp/backstage-plugins/commit/8263bf099736cbb0d0f2316082d338ba81fa6927))

## @janus-idp/backstage-plugin-argocd [1.0.4](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-argocd@1.0.3...@janus-idp/backstage-plugin-argocd@1.0.4) (2024-05-14)

### Bug Fixes

- **argocd:** make refreshInterval configuration as optional ([#1647](https://github.com/janus-idp/backstage-plugins/issues/1647)) ([2c24d35](https://github.com/janus-idp/backstage-plugins/commit/2c24d35f050801801c597967e890b6d2e647fb06))

## @janus-idp/backstage-plugin-argocd [1.0.3](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-argocd@1.0.2...@janus-idp/backstage-plugin-argocd@1.0.3) (2024-05-09)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.8.6

## @janus-idp/backstage-plugin-argocd [1.0.2](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-argocd@1.0.1...@janus-idp/backstage-plugin-argocd@1.0.2) (2024-05-08)

### Bug Fixes

- **argocd:** fix sonarcloud lint warnings in argocd plugin ([#1620](https://github.com/janus-idp/backstage-plugins/issues/1620)) ([66d3763](https://github.com/janus-idp/backstage-plugins/commit/66d3763324d83875fa30d568cd3fd1d69c72a7e7))

## @janus-idp/backstage-plugin-argocd [1.0.1](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-argocd@1.0.0...@janus-idp/backstage-plugin-argocd@1.0.1) (2024-05-07)

### Bug Fixes

- **argocd:** fix argocd configurations visibility ([#1618](https://github.com/janus-idp/backstage-plugins/issues/1618)) ([ade677f](https://github.com/janus-idp/backstage-plugins/commit/ade677f1bccff30b16091c76112c3b6aaf7fa421))

### Other changes

- **argocd:** add playwright dev mode tests ([#1616](https://github.com/janus-idp/backstage-plugins/issues/1616)) ([07c1452](https://github.com/janus-idp/backstage-plugins/commit/07c1452b3098f2a4a59477845a9ab678d1766fba))

## @janus-idp/backstage-plugin-argocd 1.0.0 (2024-05-07)

### Features

- **argocd:** add argocd deployment lifecycle and summary component ([#1540](https://github.com/janus-idp/backstage-plugins/issues/1540)) ([4c7c533](https://github.com/janus-idp/backstage-plugins/commit/4c7c533cae664efc5deff15f7411ed4d74c287a7))
- **argocd:** create a new plugin for argocd ([#1360](https://github.com/janus-idp/backstage-plugins/issues/1360)) ([a3b6916](https://github.com/janus-idp/backstage-plugins/commit/a3b691688942c53892717f8f05e0e06bdaba6454))
