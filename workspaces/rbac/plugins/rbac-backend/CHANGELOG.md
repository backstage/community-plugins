### Dependencies

## 5.2.5

### Patch Changes

- a6e850f: Updated dependency `msw` to `1.3.5`.

## 5.2.4

### Patch Changes

- dd0e2b4: chore: use workspace dependencies
- b7c2fa1: Updated supported-versions to ^1.28.4.
- Updated dependencies [b7c2fa1]
  - @backstage-community/plugin-rbac-common@1.12.2
  - @backstage-community/plugin-rbac-node@1.8.2

## 5.2.3

### Patch Changes

- 2249d08: bump rbac plugins to include latest changes in janus

## 5.2.2

### Patch Changes

- 019f010: Migrated from [janus-idp/backstage-plugins](https://github.com/janus-idp/backstage-plugins).
- Updated dependencies [019f010]
  - @backstage-community/plugin-rbac-common@1.12.1
  - @backstage-community/plugin-rbac-node@1.8.1

## 5.2.1

### Patch Changes

- 0646434: Fix broken plugin startup: don't attempt to store permission policies that are already stored.

## 5.2.0

### Minor Changes

- 8244f28: chore(deps): update to backstage 1.32

### Patch Changes

- Updated dependencies [8244f28]
  - @janus-idp/backstage-plugin-audit-log-node@1.7.0
  - @backstage-community/plugin-rbac-common@1.12.0
  - @backstage-community/plugin-rbac-node@1.8.0

## 5.1.2

### Patch Changes

- 7342e9b: chore: remove @janus-idp/cli dep and relink local packages

  This update removes `@janus-idp/cli` from all plugins, as it’s no longer necessary. Additionally, packages are now correctly linked with a specified version.

## 5.1.1

### Patch Changes

- e6ef910: Refactors the rbac backend plugin to prevent the creation of permission policies and roles whenever the plugin and permission framework is disabled

## 5.1.0

### Minor Changes

- d9551ae: feat(deps): update to backstage 1.31

### Patch Changes

- d9551ae: Refactors the rbac backend plugin to move the admin role and admin permission creation to a separate file
- d9551ae: Change local package references to a `*`
- d9551ae: upgrade to yarn v3
- Updated dependencies [d9551ae]
- Updated dependencies [d9551ae]
- Updated dependencies [d9551ae]
  - @backstage-community/plugin-rbac-common@1.11.0
  - @janus-idp/backstage-plugin-audit-log-node@1.6.0
  - @backstage-community/plugin-rbac-node@1.7.0

* **@janus-idp/backstage-plugin-audit-log-node:** upgraded to 1.5.1

### Dependencies

- **@janus-idp/backstage-plugin-audit-log-node:** upgraded to 1.5.0
- **@backstage-community/plugin-rbac-common:** upgraded to 1.10.0
- **@backstage-community/plugin-rbac-node:** upgraded to 1.6.0

### Dependencies

- **@janus-idp/backstage-plugin-audit-log-node:** upgraded to 1.4.1

### Dependencies

- **@backstage-community/plugin-rbac-common:** upgraded to 1.9.0
- **@backstage-community/plugin-rbac-node:** upgraded to 1.5.0

## @backstage-community/plugin-rbac-backend [4.7.3](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac-backend@4.7.2...@backstage-community/plugin-rbac-backend@4.7.3) (2024-08-06)

### Bug Fixes

- **rbac:** implement conditional aliases ([#1847](https://github.com/janus-idp/backstage-plugins/issues/1847)) ([dbc9a0b](https://github.com/janus-idp/backstage-plugins/commit/dbc9a0bc92f19a4382e406f83b4889905dc6e33d))

### Dependencies

- **@backstage-community/plugin-rbac-common:** upgraded to 1.8.2

## @backstage-community/plugin-rbac-backend [4.7.2](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac-backend@4.7.1...@backstage-community/plugin-rbac-backend@4.7.2) (2024-08-05)

### Bug Fixes

- **rbac:** add additional validation for permission policies ([#1908](https://github.com/janus-idp/backstage-plugins/issues/1908)) ([592498f](https://github.com/janus-idp/backstage-plugins/commit/592498f34a3b605162d3c242184aa6877b0360e8)), closes [#1939](https://github.com/janus-idp/backstage-plugins/issues/1939)

### Dependencies

- **@backstage-community/plugin-rbac-common:** upgraded to 1.8.1

## @backstage-community/plugin-rbac-backend [4.7.1](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac-backend@4.7.0...@backstage-community/plugin-rbac-backend@4.7.1) (2024-08-02)

### Bug Fixes

- **rbac:** log when plugin has no permissions ([#1917](https://github.com/janus-idp/backstage-plugins/issues/1917)) ([cc8752b](https://github.com/janus-idp/backstage-plugins/commit/cc8752b159364fdab62e7bbdaa51ca811288197b))

## @backstage-community/plugin-rbac-backend [4.7.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac-backend@4.6.1...@backstage-community/plugin-rbac-backend@4.7.0) (2024-07-30)

### Features

- **argocd:** add permission support for argocd ([#1855](https://github.com/janus-idp/backstage-plugins/issues/1855)) ([3b78237](https://github.com/janus-idp/backstage-plugins/commit/3b782377683605ea4d584c43bea14be2f435003d))

## @backstage-community/plugin-rbac-backend [4.6.1](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac-backend@4.6.0...@backstage-community/plugin-rbac-backend@4.6.1) (2024-07-29)

### Bug Fixes

- **rbac:** fix uncommited knex transaction in the addGroupingPolicies ([#1968](https://github.com/janus-idp/backstage-plugins/issues/1968)) ([24d5eef](https://github.com/janus-idp/backstage-plugins/commit/24d5eeffbce685bbe05f8895fe3a69ee26a4eb8a))

## @backstage-community/plugin-rbac-backend [4.6.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac-backend@4.5.0...@backstage-community/plugin-rbac-backend@4.6.0) (2024-07-26)

### Features

- **tekton:** add permissions support for tekton plugin ([#1854](https://github.com/janus-idp/backstage-plugins/issues/1854)) ([f744896](https://github.com/janus-idp/backstage-plugins/commit/f7448963c252574e0309a091563c19e1ed9a58fd))

## @backstage-community/plugin-rbac-backend [4.5.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac-backend@4.4.3...@backstage-community/plugin-rbac-backend@4.5.0) (2024-07-26)

### Features

- **deps:** update to backstage 1.29 ([#1900](https://github.com/janus-idp/backstage-plugins/issues/1900)) ([f53677f](https://github.com/janus-idp/backstage-plugins/commit/f53677fb02d6df43a9de98c43a9f101a6db76802))

### Dependencies

- **@backstage-community/plugin-rbac-common:** upgraded to 1.8.0
- **@backstage-community/plugin-rbac-node:** upgraded to 1.4.0

## @backstage-community/plugin-rbac-backend [4.4.3](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac-backend@4.4.2...@backstage-community/plugin-rbac-backend@4.4.3) (2024-07-25)

### Documentation

- **rbac:** add curl request examples ([#1913](https://github.com/janus-idp/backstage-plugins/issues/1913)) ([e496eb7](https://github.com/janus-idp/backstage-plugins/commit/e496eb73349987d43caba86a29e4c98c86179250))

## @backstage-community/plugin-rbac-backend [4.4.2](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac-backend@4.4.1...@backstage-community/plugin-rbac-backend@4.4.2) (2024-07-24)

### Bug Fixes

- **deps:** rollback unreleased plugins ([#1951](https://github.com/janus-idp/backstage-plugins/issues/1951)) ([8b77969](https://github.com/janus-idp/backstage-plugins/commit/8b779694f02f8125587296305276b84cdfeeaebe))

### Dependencies

- **@backstage-community/plugin-rbac-common:** upgraded to 1.7.2
- **@backstage-community/plugin-rbac-node:** upgraded to 1.3.1

## @backstage-community/plugin-rbac-backend [4.4.1](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac-backend@4.4.0...@backstage-community/plugin-rbac-backend@4.4.1) (2024-07-24)

### Bug Fixes

- **rbac:** don't start transaction if there no group policies ([#1923](https://github.com/janus-idp/backstage-plugins/issues/1923)) ([dffa964](https://github.com/janus-idp/backstage-plugins/commit/dffa9643b500a19dc70c66cedf9016508cdb5947))

## @backstage-community/plugin-rbac-backend [4.4.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac-backend@4.3.4...@backstage-community/plugin-rbac-backend@4.4.0) (2024-07-24)

### Features

- **deps:** update to backstage 1.28 ([#1891](https://github.com/janus-idp/backstage-plugins/issues/1891)) ([1ba1108](https://github.com/janus-idp/backstage-plugins/commit/1ba11088e0de60e90d138944267b83600dc446e5))

### Bug Fixes

- **deps:** fix rbac dependencies ([#1918](https://github.com/janus-idp/backstage-plugins/issues/1918)) ([fcc4e1d](https://github.com/janus-idp/backstage-plugins/commit/fcc4e1dde55bc0fb2dd284d256330c7f9f928036))
- **deps:** move backend-test-utils to devDependencies ([#1944](https://github.com/janus-idp/backstage-plugins/issues/1944)) ([9052a3f](https://github.com/janus-idp/backstage-plugins/commit/9052a3f41cae1cd57fb8f52033ea2c6f752f64fe))

### Documentation

- added OpenAPI spec for rbac-backend ([#1830](https://github.com/janus-idp/backstage-plugins/issues/1830)) ([4eb2035](https://github.com/janus-idp/backstage-plugins/commit/4eb20351bf9713355cb79905a2e49aeec9ad6ec9))
- **rbac:** fix condition rules api url ([#1914](https://github.com/janus-idp/backstage-plugins/issues/1914)) ([e6fa0ae](https://github.com/janus-idp/backstage-plugins/commit/e6fa0ae7265ea56b50fffbf1466540a61d714ed8))

## @backstage-community/plugin-rbac-backend [4.3.4](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac-backend@4.3.3...@backstage-community/plugin-rbac-backend@4.3.4) (2024-07-17)

### Bug Fixes

- **rbac:** simplify db logic ([#1842](https://github.com/janus-idp/backstage-plugins/issues/1842)) ([cbe263b](https://github.com/janus-idp/backstage-plugins/commit/cbe263b2901c0d57105667caf2d3ab7c0583468a))

## @backstage-community/plugin-rbac-backend [4.3.3](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac-backend@4.3.2...@backstage-community/plugin-rbac-backend@4.3.3) (2024-07-16)

### Bug Fixes

- **rbac:** catch errors whenever a plugin token is not generated ([#1866](https://github.com/janus-idp/backstage-plugins/issues/1866)) ([c9abf44](https://github.com/janus-idp/backstage-plugins/commit/c9abf441591347753fe94fe2590b8059804baeb7))

## @backstage-community/plugin-rbac-backend [4.3.2](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac-backend@4.3.1...@backstage-community/plugin-rbac-backend@4.3.2) (2024-07-05)

### Bug Fixes

- **rbac:** casbinDBAdapterFactory supporting postgres schema configuration ([#1841](https://github.com/janus-idp/backstage-plugins/issues/1841)) ([c0e63f9](https://github.com/janus-idp/backstage-plugins/commit/c0e63f9541edc121c77d6569d6fe6958ce937c0b))
- **rbac:** correct plugin ID matching to permission policy ([#1795](https://github.com/janus-idp/backstage-plugins/issues/1795)) ([6dc4b1c](https://github.com/janus-idp/backstage-plugins/commit/6dc4b1c23d22252f394eecd8b795ac15507ecc50))
- **rbac:** update rbac common to fix compilation ([#1858](https://github.com/janus-idp/backstage-plugins/issues/1858)) ([48f142b](https://github.com/janus-idp/backstage-plugins/commit/48f142b447f0d1677ba3f16b2a3c8972b22d0588))

## @backstage-community/plugin-rbac-backend [4.3.1](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac-backend@4.3.0...@backstage-community/plugin-rbac-backend@4.3.1) (2024-06-19)

## @backstage-community/plugin-rbac-backend [4.3.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac-backend@4.2.0...@backstage-community/plugin-rbac-backend@4.3.0) (2024-06-13)

### Features

- **deps:** update to backstage 1.27 ([#1683](https://github.com/janus-idp/backstage-plugins/issues/1683)) ([a14869c](https://github.com/janus-idp/backstage-plugins/commit/a14869c3f4177049cb8d6552b36c3ffd17e7997d))

### Dependencies

- **@backstage-community/plugin-rbac-common:** upgraded to 1.6.0
- **@backstage-community/plugin-rbac-node:** upgraded to 1.2.0
- **@janus-idp/backstage-plugin-audit-log-node:** upgraded to 1.2.0

## @backstage-community/plugin-rbac-backend [4.2.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac-backend@4.1.0...@backstage-community/plugin-rbac-backend@4.2.0) (2024-06-05)

### Features

- **rbac:** add type checks with generics for audit log ([#1789](https://github.com/janus-idp/backstage-plugins/issues/1789)) ([ac69838](https://github.com/janus-idp/backstage-plugins/commit/ac698382f64fe91e0f9f9232dd3eecd9cc9247be))

### Dependencies

- **@janus-idp/backstage-plugin-audit-log-node:** upgraded to 1.1.0

## @backstage-community/plugin-rbac-backend [4.1.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac-backend@4.0.2...@backstage-community/plugin-rbac-backend@4.1.0) (2024-06-04)

### Features

- **rbac:** add audit log for RBAC backend ([#1726](https://github.com/janus-idp/backstage-plugins/issues/1726)) ([e50464b](https://github.com/janus-idp/backstage-plugins/commit/e50464bcb38e9897ddfe208fdeef699e4bfeda3a))

### Dependencies

- **@backstage-community/plugin-rbac-common:** upgraded to 1.5.0
- **@backstage-community/plugin-rbac-node:** upgraded to 1.1.2
- **@janus-idp/backstage-plugin-audit-log-node:** upgraded to 1.0.3

## @backstage-community/plugin-rbac-backend [4.0.2](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac-backend@4.0.1...@backstage-community/plugin-rbac-backend@4.0.2) (2024-06-04)

### Bug Fixes

- **rbac:** fix handling condition action conflicts ([#1781](https://github.com/janus-idp/backstage-plugins/issues/1781)) ([966b2b2](https://github.com/janus-idp/backstage-plugins/commit/966b2b200e0ade0ce600901a7853a4a94751df22))

## @backstage-community/plugin-rbac-backend [4.0.1](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac-backend@4.0.0...@backstage-community/plugin-rbac-backend@4.0.1) (2024-06-03)

### Bug Fixes

- **rbac:** add support for scaling ([#1757](https://github.com/janus-idp/backstage-plugins/issues/1757)) ([caddc83](https://github.com/janus-idp/backstage-plugins/commit/caddc832e0df5199a455539d3538635448691c2d))

## @backstage-community/plugin-rbac-backend [4.0.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac-backend@3.3.0...@backstage-community/plugin-rbac-backend@4.0.0) (2024-05-31)

### ⚠ BREAKING CHANGES

- **rbac:** This will lead to more strict validation on the source of permission policies and roles based on the where the first role is defined.

Improves the validation of the different sources of permission policies and roles. Aims to make policy definition more consistent.

Now checks if a permission policy or role with new member matches the originating role's source and prevents any action if the sources do not match. Exception includes the event of adding
new permission policies to the RBAC Admin role defined by the configuration file. Sources include 'REST, 'CSV', 'Configuration', and 'legacy'.

Before updating, ensure that you have attempted to migrate all permission policies and roles to a single source. This can be done by checking source information through the REST API and
by querying the database. Make updates through one of the available avenues: REST API, CSV file, and the database.

To view the originating source for a particular role, query the role-metadata table or use the GET roles endpoint.

- feat(rbac): remove the ability to add permission policies to configuration role

- feat(rbac): remove no longer needed check for source in EnforcerDelegate

- feat(rbac): update yarn lock

- feat(rbac): address review comments

### Features

- **rbac:** improve validation from source ([#1643](https://github.com/janus-idp/backstage-plugins/issues/1643)) ([5f983cb](https://github.com/janus-idp/backstage-plugins/commit/5f983cbc0184e0a8e74f7e89cdff71d5ed5cd2fa))

## @backstage-community/plugin-rbac-backend [3.3.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac-backend@3.2.0...@backstage-community/plugin-rbac-backend@3.3.0) (2024-05-29)

### Features

- **rbac:** improve conditional policy validation ([#1673](https://github.com/janus-idp/backstage-plugins/issues/1673)) ([15dac91](https://github.com/janus-idp/backstage-plugins/commit/15dac91b673c63a4e7ac41f95296651df2ef8053))

## @backstage-community/plugin-rbac-backend [3.2.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac-backend@3.1.1...@backstage-community/plugin-rbac-backend@3.2.0) (2024-05-21)

### Features

- **topology:** add permissions to topology plugin ([#1665](https://github.com/janus-idp/backstage-plugins/issues/1665)) ([9d8f244](https://github.com/janus-idp/backstage-plugins/commit/9d8f244ae136cdf1980a5abf416180bce3f235ea))

## @backstage-community/plugin-rbac-backend [3.1.1](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac-backend@3.1.0...@backstage-community/plugin-rbac-backend@3.1.1) (2024-05-16)

## @backstage-community/plugin-rbac-backend [3.1.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac-backend@3.0.0...@backstage-community/plugin-rbac-backend@3.1.0) (2024-05-14)

### Features

- **rbac:** implement a file watcher for csv reloads ([#1587](https://github.com/janus-idp/backstage-plugins/issues/1587)) ([62fcafc](https://github.com/janus-idp/backstage-plugins/commit/62fcafcdb3ab3cb308b16b8fab0a14916b921b82))

### Bug Fixes

- **rbac:** fix sonar cloud issues for rbac-backend plugin ([#1619](https://github.com/janus-idp/backstage-plugins/issues/1619)) ([bf93354](https://github.com/janus-idp/backstage-plugins/commit/bf9335404232f8ec66253f56387d3432d8839406))

## @backstage-community/plugin-rbac-backend [3.0.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac-backend@2.8.2...@backstage-community/plugin-rbac-backend@3.0.0) (2024-05-10)

### ⚠ BREAKING CHANGES

- **rbac:** remove token manager for auth service (#1632)

### Bug Fixes

- **rbac:** remove token manager for auth service ([#1632](https://github.com/janus-idp/backstage-plugins/issues/1632)) ([2f19655](https://github.com/janus-idp/backstage-plugins/commit/2f196556cffc61c83239721b1cd51d6a2c64eee7))

## @backstage-community/plugin-rbac-backend [2.8.2](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac-backend@2.8.1...@backstage-community/plugin-rbac-backend@2.8.2) (2024-05-09)

### Dependencies

- **@backstage-community/plugin-rbac-common:** upgraded to 1.4.2
- **@backstage-community/plugin-rbac-node:** upgraded to 1.1.1

## @backstage-community/plugin-rbac-backend [2.8.1](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac-backend@2.8.0...@backstage-community/plugin-rbac-backend@2.8.1) (2024-05-07)

### Bug Fixes

- **rbac:** implement ability to disable rbac-backend plugin ([#1501](https://github.com/janus-idp/backstage-plugins/issues/1501)) ([6367965](https://github.com/janus-idp/backstage-plugins/commit/6367965c550286dc8423b0942341ecee178dc6c1))

## @backstage-community/plugin-rbac-backend [2.8.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac-backend@2.7.1...@backstage-community/plugin-rbac-backend@2.8.0) (2024-05-07)

### Features

- **rbac:** add support for the new backend services ([#1607](https://github.com/janus-idp/backstage-plugins/issues/1607)) ([2892709](https://github.com/janus-idp/backstage-plugins/commit/2892709860987c6f4b36d821afa2e612b220d030))

## @backstage-community/plugin-rbac-backend [2.7.1](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac-backend@2.7.0...@backstage-community/plugin-rbac-backend@2.7.1) (2024-05-06)

### Bug Fixes

- **ocm:** update ocm frontend plugin readme ([#1611](https://github.com/janus-idp/backstage-plugins/issues/1611)) ([9960cc0](https://github.com/janus-idp/backstage-plugins/commit/9960cc0c2d611cdd1ee10a82ed02b7be9becefcf))

## @backstage-community/plugin-rbac-backend [2.7.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac-backend@2.6.4...@backstage-community/plugin-rbac-backend@2.7.0) (2024-04-25)

### Features

- **rbac:** add the optional maxDepth feature ([#1486](https://github.com/janus-idp/backstage-plugins/issues/1486)) ([ea87f34](https://github.com/janus-idp/backstage-plugins/commit/ea87f3412eb374123ea623332de0648d4c7bda5c))
- **rbac:** lazy load temporary enforcer ([#1513](https://github.com/janus-idp/backstage-plugins/issues/1513)) ([b5f1552](https://github.com/janus-idp/backstage-plugins/commit/b5f1552f069068af43a4ca2756a5a38187f6d453))

## @backstage-community/plugin-rbac-backend [2.6.4](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac-backend@2.6.3...@backstage-community/plugin-rbac-backend@2.6.4) (2024-04-17)

### Bug Fixes

- **rbac:** reduce the number of permissions returned, add isResourced flag ([#1474](https://github.com/janus-idp/backstage-plugins/issues/1474)) ([e5dda95](https://github.com/janus-idp/backstage-plugins/commit/e5dda95bfc87d1d5d404726cbbe05c8bfdb73845))

### Dependencies

- **@backstage-community/plugin-rbac-common:** upgraded to 1.4.1

## @backstage-community/plugin-rbac-backend [2.6.3](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac-backend@2.6.2...@backstage-community/plugin-rbac-backend@2.6.3) (2024-04-15)

### Dependencies

- **@backstage-community/plugin-rbac-node:** upgraded to 1.1.0

## @backstage-community/plugin-rbac-backend [2.6.2](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac-backend@2.6.1...@backstage-community/plugin-rbac-backend@2.6.2) (2024-04-09)

### Dependencies

- **@backstage-community/plugin-rbac-node:** upgraded to 1.0.6

## @backstage-community/plugin-rbac-backend [2.6.1](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac-backend@2.6.0...@backstage-community/plugin-rbac-backend@2.6.1) (2024-04-08)

### Dependencies

- **@backstage-community/plugin-rbac-node:** upgraded to 1.0.5

## @backstage-community/plugin-rbac-backend [2.6.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac-backend@2.5.1...@backstage-community/plugin-rbac-backend@2.6.0) (2024-04-05)

### Features

- **rbac:** save role modification information to the metadata ([#1280](https://github.com/janus-idp/backstage-plugins/issues/1280)) ([0454509](https://github.com/janus-idp/backstage-plugins/commit/0454509e41db2ae332d1b2bf8f72d34241483efd))

### Dependencies

- **@backstage-community/plugin-rbac-common:** upgraded to 1.4.0
- **@backstage-community/plugin-rbac-node:** upgraded to 1.0.5

## @backstage-community/plugin-rbac-backend [2.5.1](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac-backend@2.5.0...@backstage-community/plugin-rbac-backend@2.5.1) (2024-04-04)

### Bug Fixes

- **rbac:** rework condition policies to bound them to RBAC roles ([#1330](https://github.com/janus-idp/backstage-plugins/issues/1330)) ([55c00b2](https://github.com/janus-idp/backstage-plugins/commit/55c00b21b27b449cb0e5100c7b64a6ae742536ac))

### Dependencies

- **@backstage-community/plugin-rbac-common:** upgraded to 1.3.2

## @backstage-community/plugin-rbac-backend [2.5.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac-backend@2.4.1...@backstage-community/plugin-rbac-backend@2.5.0) (2024-03-29)

### Features

- **rbac:** load filtered policies before enforcing ([#1387](https://github.com/janus-idp/backstage-plugins/issues/1387)) ([66980ba](https://github.com/janus-idp/backstage-plugins/commit/66980baebd4d8b5b398646bcab1750c0edec715e))

### Dependencies

- **@backstage-community/plugin-rbac-common:** upgraded to 1.3.1
- **@backstage-community/plugin-rbac-node:** upgraded to 1.0.4

## @backstage-community/plugin-rbac-backend [2.4.1](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac-backend@2.4.0...@backstage-community/plugin-rbac-backend@2.4.1) (2024-03-19)

### Bug Fixes

- **rbac:** pass token to readUrl for well-known permission endpoint ([#1342](https://github.com/janus-idp/backstage-plugins/issues/1342)) ([36b7c77](https://github.com/janus-idp/backstage-plugins/commit/36b7c7739753bd1cc55d10aa68d41ed7e15162e6))

## @backstage-community/plugin-rbac-backend [2.4.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac-backend@2.3.5...@backstage-community/plugin-rbac-backend@2.4.0) (2024-03-14)

### Features

- **rbac:** query the catalog database when building graph ([#1298](https://github.com/janus-idp/backstage-plugins/issues/1298)) ([c2c9e22](https://github.com/janus-idp/backstage-plugins/commit/c2c9e22e90a594e2a44d1683a05d3111c4baa97b))

### Bug Fixes

- **rbac:** remove admin metadata, when all admins removed from config ([#1314](https://github.com/janus-idp/backstage-plugins/issues/1314)) ([cc6555e](https://github.com/janus-idp/backstage-plugins/commit/cc6555ea22a191c9f9f554b1909b67e517deee71))

## @backstage-community/plugin-rbac-backend [2.3.5](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac-backend@2.3.4...@backstage-community/plugin-rbac-backend@2.3.5) (2024-03-07)

### Bug Fixes

- **rbac:** check source before throwing duplicate warning ([#1278](https://github.com/janus-idp/backstage-plugins/issues/1278)) ([a100eef](https://github.com/janus-idp/backstage-plugins/commit/a100eef67983ba73d929864f0b64991de69718d0))

## @backstage-community/plugin-rbac-backend [2.3.4](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac-backend@2.3.3...@backstage-community/plugin-rbac-backend@2.3.4) (2024-03-04)

### Dependencies

- **@backstage-community/plugin-rbac-node:** upgraded to 1.0.3

## @backstage-community/plugin-rbac-backend [2.3.3](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac-backend@2.3.2...@backstage-community/plugin-rbac-backend@2.3.3) (2024-02-29)

### Documentation

- **rbac:** update to the rbac documentation ([#1268](https://github.com/janus-idp/backstage-plugins/issues/1268)) ([5c7253b](https://github.com/janus-idp/backstage-plugins/commit/5c7253b7d0646433c55f185092648f0816aee88e))

## @backstage-community/plugin-rbac-backend [2.3.2](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac-backend@2.3.1...@backstage-community/plugin-rbac-backend@2.3.2) (2024-02-28)

### Bug Fixes

- **rbac:** improve error handling in retrieving permission metadata. ([#1285](https://github.com/janus-idp/backstage-plugins/issues/1285)) ([77f5f0e](https://github.com/janus-idp/backstage-plugins/commit/77f5f0efaadf1873b68876f11ca633646ce882b9))

## @backstage-community/plugin-rbac-backend [2.3.1](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac-backend@2.3.0...@backstage-community/plugin-rbac-backend@2.3.1) (2024-02-27)

### Dependencies

- **@backstage-community/plugin-rbac-node:** upgraded to 1.0.2

## @backstage-community/plugin-rbac-backend [2.3.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac-backend@2.2.4...@backstage-community/plugin-rbac-backend@2.3.0) (2024-02-21)

### Features

- **rbac:** backend part - store role description to the database ([#1178](https://github.com/janus-idp/backstage-plugins/issues/1178)) ([ec8b1c2](https://github.com/janus-idp/backstage-plugins/commit/ec8b1c27cce5c36997f84a068dc4cc5cc542f428))

### Bug Fixes

- **rbac:** reduce the catalog calls when build graph ([#1203](https://github.com/janus-idp/backstage-plugins/issues/1203)) ([e63aac2](https://github.com/janus-idp/backstage-plugins/commit/e63aac2a8e7513974a5aabb3ce25c838d6b34dde))

### Dependencies

- **@backstage-community/plugin-rbac-common:** upgraded to 1.3.0
- **@backstage-community/plugin-rbac-node:** upgraded to 1.0.1

## @backstage-community/plugin-rbac-backend [2.2.4](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac-backend@2.2.3...@backstage-community/plugin-rbac-backend@2.2.4) (2024-02-20)

### Bug Fixes

- **rbac:** drop database disabled mode ([#1214](https://github.com/janus-idp/backstage-plugins/issues/1214)) ([b18d80d](https://github.com/janus-idp/backstage-plugins/commit/b18d80dd14e6b7f4f9c90d72ec418609ff1f6a67))

## @backstage-community/plugin-rbac-backend [2.2.3](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac-backend@2.2.2...@backstage-community/plugin-rbac-backend@2.2.3) (2024-02-14)

### Bug Fixes

- **rbac:** allow for super users to have allow all access ([#1208](https://github.com/janus-idp/backstage-plugins/issues/1208)) ([c02a4b0](https://github.com/janus-idp/backstage-plugins/commit/c02a4b029a800b1bcf1f2e2722185faae1e5837e))

## @backstage-community/plugin-rbac-backend [2.2.2](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac-backend@2.2.1...@backstage-community/plugin-rbac-backend@2.2.2) (2024-02-13)

### Bug Fixes

- **rbac:** display resource typed permissions by name too ([#1197](https://github.com/janus-idp/backstage-plugins/issues/1197)) ([bc4e8e7](https://github.com/janus-idp/backstage-plugins/commit/bc4e8e783b1acd8088a45ffed4d902fd9515c2e8))

## @backstage-community/plugin-rbac-backend [2.2.1](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac-backend@2.2.0...@backstage-community/plugin-rbac-backend@2.2.1) (2024-02-12)

### Bug Fixes

- **rbac:** csv updates no longer require server restarts ([#1171](https://github.com/janus-idp/backstage-plugins/issues/1171)) ([ed6fe65](https://github.com/janus-idp/backstage-plugins/commit/ed6fe65d99a2c2facf832a84d29dabc8d339e328))

## @backstage-community/plugin-rbac-backend [2.2.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac-backend@2.1.3...@backstage-community/plugin-rbac-backend@2.2.0) (2024-02-08)

### Features

- add support for the new backend system to the `rbac-backend` plugin ([#1179](https://github.com/janus-idp/backstage-plugins/issues/1179)) ([d625cb2](https://github.com/janus-idp/backstage-plugins/commit/d625cb2470513862027e048c70944275043ce70a))

### Dependencies

- **@backstage-community/plugin-rbac-node:** upgraded to 1.0.0

## @backstage-community/plugin-rbac-backend [2.1.3](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac-backend@2.1.2...@backstage-community/plugin-rbac-backend@2.1.3) (2024-02-02)

### Bug Fixes

- **rbac:** set up higher jest timeout for rbac db tests ([#1163](https://github.com/janus-idp/backstage-plugins/issues/1163)) ([b8541f3](https://github.com/janus-idp/backstage-plugins/commit/b8541f3ac149446238dc07432116fafc23a48a82))
- **rbac:** split policies and roles by source ([#1042](https://github.com/janus-idp/backstage-plugins/issues/1042)) ([03a678d](https://github.com/janus-idp/backstage-plugins/commit/03a678d96deeb1d42448e94ac95d735e61393a40)), closes [#1103](https://github.com/janus-idp/backstage-plugins/issues/1103)

### Dependencies

- **@backstage-community/plugin-rbac-common:** upgraded to 1.2.1

## @backstage-community/plugin-rbac-backend [2.1.2](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac-backend@2.1.1...@backstage-community/plugin-rbac-backend@2.1.2) (2024-01-30)

### Bug Fixes

- **rbac:** enable create button for default role:default/rbac_admin ([#1137](https://github.com/janus-idp/backstage-plugins/issues/1137)) ([9926463](https://github.com/janus-idp/backstage-plugins/commit/9926463c8c46871b823796adf77bbd52eb8e6758))

## @backstage-community/plugin-rbac-backend [2.1.1](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac-backend@2.1.0...@backstage-community/plugin-rbac-backend@2.1.1) (2024-01-23)

### Bug Fixes

- **rbac:** fix work resource permission specified by name ([#940](https://github.com/janus-idp/backstage-plugins/issues/940)) ([3601eb8](https://github.com/janus-idp/backstage-plugins/commit/3601eb8d0c19e0aad27031ab61f1afa0edc78945))

## @backstage-community/plugin-rbac-backend [2.1.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac-backend@2.0.0...@backstage-community/plugin-rbac-backend@2.1.0) (2024-01-17)

### Features

- **Notifications:** new notifications FE plugin, API and backend ([#933](https://github.com/janus-idp/backstage-plugins/issues/933)) ([4d4cb78](https://github.com/janus-idp/backstage-plugins/commit/4d4cb781ca9fc331a2c621583e9203f9e4585ee7))
- **rbac:** add doc about RBAC backend conditions API ([#1027](https://github.com/janus-idp/backstage-plugins/issues/1027)) ([fc9ad53](https://github.com/janus-idp/backstage-plugins/commit/fc9ad5348d768423cbce0df7e2a4239c9a24a11e))

### Bug Fixes

- **rbac:** fix role validation ([#1020](https://github.com/janus-idp/backstage-plugins/issues/1020)) ([49c7975](https://github.com/janus-idp/backstage-plugins/commit/49c7975f74a1791e205fe3a322f1efe6504212ed))

## @backstage-community/plugin-rbac-backend [2.0.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac-backend@1.7.1...@backstage-community/plugin-rbac-backend@2.0.0) (2023-12-14)

### ⚠ BREAKING CHANGES

- **rbac:** add support for multiple policies CRUD (#984)

### Features

- **rbac:** add support for multiple policies CRUD ([#984](https://github.com/janus-idp/backstage-plugins/issues/984)) ([518c767](https://github.com/janus-idp/backstage-plugins/commit/518c7674aa037669fe9c2fc6f8dc9be5f0c8fa84))

## @backstage-community/plugin-rbac-backend [1.7.1](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac-backend@1.7.0...@backstage-community/plugin-rbac-backend@1.7.1) (2023-12-08)

### Documentation

- **rbac:** add documentation for api and known permissions ([#1000](https://github.com/janus-idp/backstage-plugins/issues/1000)) ([8f8133f](https://github.com/janus-idp/backstage-plugins/commit/8f8133f12d2a74dc6503f7545942f11c40b52092))

## @backstage-community/plugin-rbac-backend [1.7.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac-backend@1.6.6...@backstage-community/plugin-rbac-backend@1.7.0) (2023-12-07)

### Features

- **rbac:** list roles with no permission policies ([#998](https://github.com/janus-idp/backstage-plugins/issues/998)) ([217b7b0](https://github.com/janus-idp/backstage-plugins/commit/217b7b0db3414788c8e77247f378a51cf0eeda0d))

## @backstage-community/plugin-rbac-backend [1.6.6](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac-backend@1.6.5...@backstage-community/plugin-rbac-backend@1.6.6) (2023-12-05)

### Dependencies

- **@backstage-community/plugin-rbac-common:** upgraded to 1.2.0

## @backstage-community/plugin-rbac-backend [1.6.5](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac-backend@1.6.4...@backstage-community/plugin-rbac-backend@1.6.5) (2023-12-04)

### Documentation

- **rbac:** additional docs for backend configuration ([#982](https://github.com/janus-idp/backstage-plugins/issues/982)) ([17b95a0](https://github.com/janus-idp/backstage-plugins/commit/17b95a0c51e97ee5a9160dc7bec7559c075eca88))

## @backstage-community/plugin-rbac-backend [1.6.4](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac-backend@1.6.3...@backstage-community/plugin-rbac-backend@1.6.4) (2023-11-20)

### Bug Fixes

- **aap+3scale+ocm:** don't log sensitive data from errors ([#945](https://github.com/janus-idp/backstage-plugins/issues/945)) ([7a5e7b8](https://github.com/janus-idp/backstage-plugins/commit/7a5e7b8a57c9841003d9b16e1a65fb62e101fbf1))

## @backstage-community/plugin-rbac-backend [1.6.3](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac-backend@1.6.2...@backstage-community/plugin-rbac-backend@1.6.3) (2023-11-13)

### Bug Fixes

- **rbac:** use the same Knex version with Backstage ([#929](https://github.com/janus-idp/backstage-plugins/issues/929)) ([6923ce0](https://github.com/janus-idp/backstage-plugins/commit/6923ce07d787ea6edd911ab348704ba6b9f95ada))

## @backstage-community/plugin-rbac-backend [1.6.2](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac-backend@1.6.1...@backstage-community/plugin-rbac-backend@1.6.2) (2023-11-10)

### Bug Fixes

- **rbac:** handle postgres ssl connection for rbac backend plugin ([#923](https://github.com/janus-idp/backstage-plugins/issues/923)) ([deb2026](https://github.com/janus-idp/backstage-plugins/commit/deb202642f456cda446a99f55a475eeaddc59e7c))

## @backstage-community/plugin-rbac-backend [1.6.1](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac-backend@1.6.0...@backstage-community/plugin-rbac-backend@1.6.1) (2023-11-01)

### Bug Fixes

- **rbac:** add migration folder to rbac-backend package ([#897](https://github.com/janus-idp/backstage-plugins/issues/897)) ([694a9d6](https://github.com/janus-idp/backstage-plugins/commit/694a9d65bd986eb8e7fde3d66e012963033741af))

## @backstage-community/plugin-rbac-backend [1.6.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac-backend@1.5.1...@backstage-community/plugin-rbac-backend@1.6.0) (2023-10-31)

### Features

- **rbac:** implement REST method to list all plugin permission policies ([#808](https://github.com/janus-idp/backstage-plugins/issues/808)) ([0a17e67](https://github.com/janus-idp/backstage-plugins/commit/0a17e67cbb72416176e978fc3ed8868855375a8b))

## @backstage-community/plugin-rbac-backend [1.5.1](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac-backend@1.5.0...@backstage-community/plugin-rbac-backend@1.5.1) (2023-10-30)

### Bug Fixes

- **rbac:** fix service to service requests for RBAC CRUD ([#886](https://github.com/janus-idp/backstage-plugins/issues/886)) ([0b72d73](https://github.com/janus-idp/backstage-plugins/commit/0b72d7373dddc3f4d8c5076ca3800745bf619d85))

## @backstage-community/plugin-rbac-backend [1.5.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac-backend@1.4.0...@backstage-community/plugin-rbac-backend@1.5.0) (2023-10-30)

### Features

- **rbac:** implement conditional policies feature. ([#833](https://github.com/janus-idp/backstage-plugins/issues/833)) ([3c0675b](https://github.com/janus-idp/backstage-plugins/commit/3c0675ba6ebf91274848981fa1e6eab9e4a1e659))

## @backstage-community/plugin-rbac-backend [1.4.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac-backend@1.3.0...@backstage-community/plugin-rbac-backend@1.4.0) (2023-10-30)

### Features

- **rbac:** add role support for policies-csv-file ([#894](https://github.com/janus-idp/backstage-plugins/issues/894)) ([7ad4902](https://github.com/janus-idp/backstage-plugins/commit/7ad4902be12a9900149a73427a6c52cbb65659f3))

## @backstage-community/plugin-rbac-backend [1.3.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac-backend@1.2.1...@backstage-community/plugin-rbac-backend@1.3.0) (2023-10-27)

### Features

- **rbac:** implement the concept of roles in rbac ([#867](https://github.com/janus-idp/backstage-plugins/issues/867)) ([4d878a2](https://github.com/janus-idp/backstage-plugins/commit/4d878a29babd86bd7896d69e6b2b63392b6e6cc8))

### Bug Fixes

- **rbac:** add models folder and config.d.ts to package ([#891](https://github.com/janus-idp/backstage-plugins/issues/891)) ([406c147](https://github.com/janus-idp/backstage-plugins/commit/406c14703110018c702834482d32fdd4f8a36cef))

### Dependencies

- **@backstage-community/plugin-rbac-common:** upgraded to 1.1.0

## @backstage-community/plugin-rbac-backend [1.2.1](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac-backend@1.2.0...@backstage-community/plugin-rbac-backend@1.2.1) (2023-10-24)

### Bug Fixes

- **rbac:** use token manager for catalog requests ([#866](https://github.com/janus-idp/backstage-plugins/issues/866)) ([8ad3480](https://github.com/janus-idp/backstage-plugins/commit/8ad348029cec4eabf605c7065e76a5305be3cac8))

## @backstage-community/plugin-rbac-backend [1.2.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac-backend@1.1.1...@backstage-community/plugin-rbac-backend@1.2.0) (2023-10-23)

### Features

- **cli:** add frontend dynamic plugins base build config ([#747](https://github.com/janus-idp/backstage-plugins/issues/747)) ([91e06da](https://github.com/janus-idp/backstage-plugins/commit/91e06da8ab108c17fd2a6531f25e01c7a7350276)), closes [#831](https://github.com/janus-idp/backstage-plugins/issues/831)

## @backstage-community/plugin-rbac-backend [1.1.1](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac-backend@1.1.0...@backstage-community/plugin-rbac-backend@1.1.1) (2023-10-19)

### Dependencies

- **@backstage-community/plugin-rbac-common:** upgraded to 1.0.1

## @backstage-community/plugin-rbac-backend [1.1.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac-backend@1.0.2...@backstage-community/plugin-rbac-backend@1.1.0) (2023-10-06)

### Features

- **rbac:** implement RBAC group support ([#803](https://github.com/janus-idp/backstage-plugins/issues/803)) ([4c72f5c](https://github.com/janus-idp/backstage-plugins/commit/4c72f5c23324ea2f7538b406d60730ea224ae758))

## @backstage-community/plugin-rbac-backend [1.0.2](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac-backend@1.0.1...@backstage-community/plugin-rbac-backend@1.0.2) (2023-10-04)

### Bug Fixes

- **rbac:** add models folder to package ([#823](https://github.com/janus-idp/backstage-plugins/issues/823)) ([e2bc66e](https://github.com/janus-idp/backstage-plugins/commit/e2bc66edac61a16ec92f75fb48c8ad459f24a23a))

## @backstage-community/plugin-rbac-backend [1.0.1](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac-backend@1.0.0...@backstage-community/plugin-rbac-backend@1.0.1) (2023-10-03)

### Documentation

- **rbac:** initial documentation for RBAC ([#814](https://github.com/janus-idp/backstage-plugins/issues/814)) ([d5cd566](https://github.com/janus-idp/backstage-plugins/commit/d5cd5666c43be5ca2790b1c548f56350ef50c96c))

## @backstage-community/plugin-rbac-backend 1.0.0 (2023-09-29)

### Bug Fixes

- **rbac:** remove private package ([#809](https://github.com/janus-idp/backstage-plugins/issues/809)) ([cf59d6d](https://github.com/janus-idp/backstage-plugins/commit/cf59d6d1c5a65363a7ccdd7490d3148d665e7d46))

### Dependencies

- **@backstage-community/plugin-rbac-common:** upgraded to 1.0.0
