### Dependencies

## 1.42.2

### Patch Changes

- 2e28d31: hide permissions for uninstalled plugins

## 1.42.1

### Patch Changes

- a2e5d4e: Added optional pagination support to getMembers API
- aec6bc2: docs(rbac): Removing Janus IDP dynamic plugin installation instructions, switching to relative paths for doc links
- ac39bff: removed shared-react dependencies
- 4719a0e: Fix to remove entire permission when no policy is selected.

## 1.42.0

### Minor Changes

- 4b58a1d: Backstage version bump to v1.39.0

### Patch Changes

- 6a59fcf: remove support and lifecycle keywords in package.json
- Updated dependencies [6a59fcf]
- Updated dependencies [4b58a1d]
  - @backstage-community/plugin-rbac-common@1.18.0

## 1.41.6

### Patch Changes

- 6c4ee27: Replaced `getTitleCase` from `shared-react` with the `capitalizeFirstLetter` utility from the RBAC plugin as part of sunsetting the `shared-react` package.
- e141237: Improve `useRoles` hook to support paginated role condition fetching using `Promise.allSettled`, ensuring partial data availability even if individual condition fetch fails.
- e958f2f: Updated dependency `@types/node` to `22.15.29`.
- 7d6d70f: Updated dependency `start-server-and-test` to `2.0.12`.
- Updated dependencies [a42945e]
  - @backstage-community/plugin-rbac-common@1.17.0

## 1.41.5

### Patch Changes

- fcc57ec: Updated dependency `@types/node` to `22.14.1`.
- 4d8a8e9: Removed theme package "@redhat-developer/red-hat-developer-hub-theme" in dev.
- 79213e4: Fixed role actions tooltip delay issue.

## 1.41.4

### Patch Changes

- eebc68d: UI Enhancements:

  - Added vertical spacing between buttons in the side drawer for improved usability.
  - Fixed layout issue in the Users and Groups table where adding a row caused unexpected height changes.
  - Aligned action icon colors in the Roles table for visual consistency.
  - Simplified label formatting in the Overview table for a cleaner look.
  - Improved dropdown behavior in Users, Groups, and Permissions sections — selecting an option no longer clears the input text.
  - Conditionally hid input field labels when validation errors are present to reduce visual clutter.
  - Aligned “No options” placeholder text across the Users and Groups and Plugin selection dropdowns.
  - Prevented backspace from unintentionally removing selected items in the Users and Groups and Plugin dropdowns.

## 1.41.3

### Patch Changes

- 658c51c: chore: Remove usage of @spotify/prettier-config
- Updated dependencies [658c51c]
  - @backstage-community/plugin-rbac-common@1.16.1

## 1.41.2

### Patch Changes

- fa53ba5: Updated dependency `@playwright/test` to `1.52.0`.

## 1.41.1

### Patch Changes

- c92a50c: Fixed a bug where updating a role name via the `PUT </api/permission/roles/:kind/:namespace/:name>` endpoint did not propagate changes to metadata, permissions and conditions, leaving them mapped to the old role name.

## 1.41.0

### Minor Changes

- e8755f6: Backstage version bump to v1.38.1

### Patch Changes

- Updated dependencies [e8755f6]
  - @backstage-community/plugin-rbac-common@1.16.0

## 1.40.1

### Patch Changes

- 1adf6a6: resolve module import error while importing from `@rjsf/utils/lib/schema/getDefaultFormState`

## 1.40.0

### Minor Changes

- d278b4c: Adds the ability to assign ownership to roles that can then be used to conditionally filter roles, permission policies, and conditional policies. The conditional filter can now be accomplished through the use of the new RBAC conditional rule `IS_OWNER`.

  `IS_OWNER` can be used to grant limited access to the RBAC plugins where in admins might want leads to control their own team's access.

  Removed the resource type from the `policy.entity.create` permission to prevent conditional rules being applied to the permission. At the moment, the plugins will still continue to work as expected. However, it is strongly recommended updating all permission policies that utilize the resource type `policy-entity` with the action `create` (ex. `role:default/some_role, policy-entity, create, allow` to `role:default/some_role, policy.entity.create, create, allow`) to prevent any future degradation in service. A migration has been supplied to automatically update all permission policies that have not originated from the CSV file. The CSV file was skipped as a duplication event could happen during reloads / restarts. This means that the CSV file will need to be updated manually to ensure that all references to the old permission policy, resource type `policy-entity` with an action of `create`, have been updated to the named permission `policy.entity.create` with an action of `create`.

### Patch Changes

- Updated dependencies [d278b4c]
  - @backstage-community/plugin-rbac-common@1.15.0

## 1.39.3

### Patch Changes

- f84ad73: chore: remove homepage field from package.json
- Updated dependencies [f84ad73]
  - @backstage-community/plugin-rbac-common@1.14.1

## 1.39.2

### Patch Changes

- c31699d: Updated dependency `@playwright/test` to `1.51.1`.
- f16f56e: Updated dependency `start-server-and-test` to `2.0.11`.

## 1.39.1

### Patch Changes

- 85541c1: RBACApiRef should be exposed to support simulation / customization based on use-cases and to mock API implementation for feature testing. #2872

## 1.39.0

### Minor Changes

- 0253db6: Backstage version bump to v1.36.1

### Patch Changes

- Updated dependencies [0253db6]
  - @backstage-community/plugin-rbac-common@1.14.0

## 1.38.3

### Patch Changes

- 32135b8: Updated dependency `@testing-library/user-event` to `14.6.1`.
- c222ea4: Updated dependency `@playwright/test` to `1.51.0`.
- 973a5ef: remove prettier from devDevpendencies

## 1.38.2

### Patch Changes

- 3f80cbb: fixed no record found was being shown before the role list get displayed
- a388178: Fix to show conditional permission policy with multiple CRUD actions on single resource-type created via CLI/CSV correctly in edit form.
- a8e2f2c: Updated dependency `@material-ui/lab` to `4.0.0-alpha.61`.
  Updated dependency `@mui/icons-material` to `5.16.14`.
  Updated dependency `@mui/material` to `5.16.14`.
  Updated dependency `@mui/styles` to `5.16.14`.
  Updated dependency `@mui/x-charts` to `6.19.8`.
  Updated dependency `@mui/lab` to `5.0.0-alpha.175`.

## 1.38.1

### Patch Changes

- 152eb5f: In edit role form show selected permissions for a plugin based on resource-type and policy mapping if resource-type used in creation of simple permission policy via CLI/CSV file.
- 3e35324: Updated dependency `start-server-and-test` to `2.0.10`.

## 1.38.0

### Minor Changes

- a7730fc: Update shared react library @janus-idp/shared-react to version 2.16.0 with newer @kubernetes/client-node@1.0.0-rc7.

## 1.37.0

### Minor Changes

- 5934dfe: Open confirmation modal with options to discard the entered information or continue with adding more information on create/edit role forms cancel button click.

## 1.36.0

### Minor Changes

- 838db28: Redesigned RBAC form permissions section.
  User will be able to select multiple plugins at once.

## 1.35.0

### Minor Changes

- 5d5c02a: Backstage version bump to v1.35.0

### Patch Changes

- Updated dependencies [5d5c02a]
  - @backstage-community/plugin-rbac-common@1.13.0

## 1.34.0

### Minor Changes

- 622dcb6: Allow admin to select multiple users/groups

## 1.33.6

### Patch Changes

- 5b19b0d: Update documentation information about `pluginsWithPermission` setting. In order for the RBAC UI to display available permissions provided by installed plugins, this setting needs to be configured.

## 1.33.5

### Patch Changes

- 0f5c451: Updated dependency `prettier` to `3.4.2`.
- 064b809: Updated dependency `start-server-and-test` to `2.0.9`.
- 18f9d9d: Updated dependency `@types/node` to `18.19.68`.
- 4eef4d1: Updated dependency `@playwright/test` to `1.49.1`.

## 1.33.4

### Patch Changes

- 27c3f1f: Fix role overview page styling issues

## 1.33.3

### Patch Changes

- aa02f04: Updated dependency `@playwright/test` to `1.49.0`.
- 4b3653a: Clean up api report warnings and remove unnecessary files
- Updated dependencies [4b3653a]
  - @backstage-community/plugin-rbac-common@1.12.3

## 1.33.2

### Patch Changes

- c3fe880: - fix: remove empty summary row
  - fix: remove `@janus-idp/cli` / `scalprum` configuration from `package.json`. Users that build and install the plugin from the source code must change their app-config.yaml from `janus-idp.backstage-plugin-rbac` to `backstage-community.plugin-rbac` and drop the module parameter. This matches now other plugins we migrated from the Janus IDP community to the Backstage community plugin and was missed before.

## 1.33.1

### Patch Changes

- ba05b93: Fixed UI issues.

## 1.33.0

### Minor Changes

- 757799e: Upgraded RBAC plugin from mui4 to mui5

## 1.32.5

### Patch Changes

- a6e850f: Updated dependency `msw` to `1.3.5`.

## 1.32.4

### Patch Changes

- 066b3bd: removed canvas from devDependencies

## 1.32.3

### Patch Changes

- dd0e2b4: chore: use workspace dependencies
- b7c2fa1: Updated supported-versions to ^1.28.4.
- Updated dependencies [b7c2fa1]
  - @backstage-community/plugin-rbac-common@1.12.2

## 1.32.2

### Patch Changes

- 2249d08: bump rbac plugins to include latest changes in janus

## 1.32.1

### Patch Changes

- 019f010: Migrated from [janus-idp/backstage-plugins](https://github.com/janus-idp/backstage-plugins).
- Updated dependencies [019f010]
  - @backstage-community/plugin-rbac-common@1.12.1

## 1.32.0

### Minor Changes

- 8244f28: chore(deps): update to backstage 1.32

### Patch Changes

- Updated dependencies [8244f28]
  - @janus-idp/shared-react@2.13.0
  - @backstage-community/plugin-rbac-common@1.12.0

## 1.31.1

### Patch Changes

- 7342e9b: chore: remove @janus-idp/cli dep and relink local packages

  This update removes `@janus-idp/cli` from all plugins, as it’s no longer necessary. Additionally, packages are now correctly linked with a specified version.

## 1.31.0

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
  - @backstage-community/plugin-rbac-common@1.11.0

* **@janus-idp/cli:** upgraded to 1.15.2

### Dependencies

- **@janus-idp/cli:** upgraded to 1.15.1

### Dependencies

- **@janus-idp/shared-react:** upgraded to 2.11.1
- **@janus-idp/cli:** upgraded to 1.15.0

### Dependencies

- **@backstage-community/plugin-rbac-common:** upgraded to 1.10.0
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

- **@backstage-community/plugin-rbac-common:** upgraded to 1.9.0

### Dependencies

- **@janus-idp/cli:** upgraded to 1.13.1

## @backstage-community/plugin-rbac [1.27.1](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.27.0...@backstage-community/plugin-rbac@1.27.1) (2024-08-06)

### Dependencies

- **@backstage-community/plugin-rbac-common:** upgraded to 1.8.2

## @backstage-community/plugin-rbac [1.27.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.26.1...@backstage-community/plugin-rbac@1.27.0) (2024-08-06)

### Features

- **rbac:** nested condition ([#1814](https://github.com/janus-idp/backstage-plugins/issues/1814)) ([228f1a9](https://github.com/janus-idp/backstage-plugins/commit/228f1a986f851885bbdba49686449b97350097d2))

## @backstage-community/plugin-rbac [1.26.1](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.26.0...@backstage-community/plugin-rbac@1.26.1) (2024-08-05)

### Dependencies

- **@backstage-community/plugin-rbac-common:** upgraded to 1.8.1

## @backstage-community/plugin-rbac [1.26.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.25.0...@backstage-community/plugin-rbac@1.26.0) (2024-08-02)

### Features

- **rbac:** show list of accessible plugins in roles list page ([#1894](https://github.com/janus-idp/backstage-plugins/issues/1894)) ([62d9d6c](https://github.com/janus-idp/backstage-plugins/commit/62d9d6c30ab393755003c9a7387b67e25dd4c3d9))

### Dependencies

- **@janus-idp/shared-react:** upgraded to 2.10.0

## @backstage-community/plugin-rbac [1.25.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.24.1...@backstage-community/plugin-rbac@1.25.0) (2024-07-26)

### Features

- **deps:** update to backstage 1.29 ([#1900](https://github.com/janus-idp/backstage-plugins/issues/1900)) ([f53677f](https://github.com/janus-idp/backstage-plugins/commit/f53677fb02d6df43a9de98c43a9f101a6db76802))

### Bug Fixes

- **deps:** update rhdh dependencies (non-major) ([#1960](https://github.com/janus-idp/backstage-plugins/issues/1960)) ([8b6c249](https://github.com/janus-idp/backstage-plugins/commit/8b6c249f1d2e8097cac0260785c26496a5be1a06))

### Dependencies

- **@backstage-community/plugin-rbac-common:** upgraded to 1.8.0
- **@janus-idp/shared-react:** upgraded to 2.9.0

## @backstage-community/plugin-rbac [1.24.1](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.24.0...@backstage-community/plugin-rbac@1.24.1) (2024-07-24)

### Bug Fixes

- **deps:** rollback unreleased plugins ([#1951](https://github.com/janus-idp/backstage-plugins/issues/1951)) ([8b77969](https://github.com/janus-idp/backstage-plugins/commit/8b779694f02f8125587296305276b84cdfeeaebe))

### Dependencies

- **@backstage-community/plugin-rbac-common:** upgraded to 1.7.2

## @backstage-community/plugin-rbac [1.24.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.23.2...@backstage-community/plugin-rbac@1.24.0) (2024-07-24)

### Features

- **deps:** update to backstage 1.28 ([#1891](https://github.com/janus-idp/backstage-plugins/issues/1891)) ([1ba1108](https://github.com/janus-idp/backstage-plugins/commit/1ba11088e0de60e90d138944267b83600dc446e5))

### Bug Fixes

- **deps:** fix rbac dependencies ([#1918](https://github.com/janus-idp/backstage-plugins/issues/1918)) ([fcc4e1d](https://github.com/janus-idp/backstage-plugins/commit/fcc4e1dde55bc0fb2dd284d256330c7f9f928036))

### Documentation

- fix rbac integration code samples ([#1905](https://github.com/janus-idp/backstage-plugins/issues/1905)) ([3a8da8d](https://github.com/janus-idp/backstage-plugins/commit/3a8da8d77797ab2bd7933c41764c9222c79b0016))

### Dependencies

- **@janus-idp/shared-react:** upgraded to 2.8.0

## @backstage-community/plugin-rbac [1.23.2](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.23.1...@backstage-community/plugin-rbac@1.23.2) (2024-07-17)

### Bug Fixes

- **rbac:** background color of sidebar in dark theme ([#1859](https://github.com/janus-idp/backstage-plugins/issues/1859)) ([ec6a2d8](https://github.com/janus-idp/backstage-plugins/commit/ec6a2d83e134988a963b331a0e2cd3a9bb58e26a))

## @backstage-community/plugin-rbac [1.23.1](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.23.0...@backstage-community/plugin-rbac@1.23.1) (2024-07-11)

### Other changes

- **rbac:** reduce cognitive stress for create, update and delete role functions ([#1878](https://github.com/janus-idp/backstage-plugins/issues/1878)) ([38c3144](https://github.com/janus-idp/backstage-plugins/commit/38c314450b01ebe71463362685242956483fef3d))

## @backstage-community/plugin-rbac [1.23.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.22.1...@backstage-community/plugin-rbac@1.23.0) (2024-07-08)

### Features

- **rbac:** show rules count in overview page ([#1845](https://github.com/janus-idp/backstage-plugins/issues/1845)) ([a10dc36](https://github.com/janus-idp/backstage-plugins/commit/a10dc368cd4e0dc28d1a99dec6d06a5f578f49db))

## @backstage-community/plugin-rbac [1.22.1](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.22.0...@backstage-community/plugin-rbac@1.22.1) (2024-07-05)

### Bug Fixes

- **rbac:** correct plugin ID matching to permission policy ([#1795](https://github.com/janus-idp/backstage-plugins/issues/1795)) ([6dc4b1c](https://github.com/janus-idp/backstage-plugins/commit/6dc4b1c23d22252f394eecd8b795ac15507ecc50))
- **rbac:** edit role page loads error page ([#1849](https://github.com/janus-idp/backstage-plugins/issues/1849)) ([6782b4b](https://github.com/janus-idp/backstage-plugins/commit/6782b4bda08019c6f81b211486ff47ba1fb2d6bf))
- **rbac:** update rbac common to fix compilation ([#1858](https://github.com/janus-idp/backstage-plugins/issues/1858)) ([48f142b](https://github.com/janus-idp/backstage-plugins/commit/48f142b447f0d1677ba3f16b2a3c8972b22d0588))

## @backstage-community/plugin-rbac [1.22.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.21.1...@backstage-community/plugin-rbac@1.22.0) (2024-06-21)

### Features

- **rbac:** show total no. of rules in review and create step ([#1827](https://github.com/janus-idp/backstage-plugins/issues/1827)) ([e54c470](https://github.com/janus-idp/backstage-plugins/commit/e54c4705de0b318a759e928999b5dcdb29f9846f))

## @backstage-community/plugin-rbac [1.21.1](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.21.0...@backstage-community/plugin-rbac@1.21.1) (2024-06-19)

### Dependencies

- **@janus-idp/shared-react:** upgraded to 2.7.1
- **@janus-idp/cli:** upgraded to 1.11.1

## @backstage-community/plugin-rbac [1.21.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.20.15...@backstage-community/plugin-rbac@1.21.0) (2024-06-13)

### Features

- **deps:** update to backstage 1.27 ([#1683](https://github.com/janus-idp/backstage-plugins/issues/1683)) ([a14869c](https://github.com/janus-idp/backstage-plugins/commit/a14869c3f4177049cb8d6552b36c3ffd17e7997d))

### Dependencies

- **@backstage-community/plugin-rbac-common:** upgraded to 1.6.0
- **@janus-idp/shared-react:** upgraded to 2.7.0
- **@janus-idp/cli:** upgraded to 1.11.0

## @backstage-community/plugin-rbac [1.20.15](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.20.14...@backstage-community/plugin-rbac@1.20.15) (2024-06-13)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.10.1

## @backstage-community/plugin-rbac [1.20.14](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.20.13...@backstage-community/plugin-rbac@1.20.14) (2024-06-05)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.10.0

## @backstage-community/plugin-rbac [1.20.13](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.20.12...@backstage-community/plugin-rbac@1.20.13) (2024-06-04)

### Dependencies

- **@backstage-community/plugin-rbac-common:** upgraded to 1.5.0
- **@janus-idp/shared-react:** upgraded to 2.6.4

## @backstage-community/plugin-rbac [1.20.12](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.20.11...@backstage-community/plugin-rbac@1.20.12) (2024-06-04)

### Bug Fixes

- **rbac:** fix role list view permission policies column value ([#1714](https://github.com/janus-idp/backstage-plugins/issues/1714)) ([07200e4](https://github.com/janus-idp/backstage-plugins/commit/07200e42d62c51c2ff59e812521ad0c82cb62ea8))

## @backstage-community/plugin-rbac [1.20.11](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.20.10...@backstage-community/plugin-rbac@1.20.11) (2024-06-03)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.9.0

## @backstage-community/plugin-rbac [1.20.10](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.20.9...@backstage-community/plugin-rbac@1.20.10) (2024-06-03)

### Bug Fixes

- **rbac:** add proper empty page for RBAC plugin ([#1728](https://github.com/janus-idp/backstage-plugins/issues/1728)) ([79e62a6](https://github.com/janus-idp/backstage-plugins/commit/79e62a6f120a7390af2e2bdc1e6dc6962c0e3780))

## @backstage-community/plugin-rbac [1.20.9](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.20.8...@backstage-community/plugin-rbac@1.20.9) (2024-05-31)

## @backstage-community/plugin-rbac [1.20.8](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.20.7...@backstage-community/plugin-rbac@1.20.8) (2024-05-31)

### Bug Fixes

- **rbac:** improve criteria toggle button readability on dark themes ([#1755](https://github.com/janus-idp/backstage-plugins/issues/1755)) ([345230b](https://github.com/janus-idp/backstage-plugins/commit/345230baa4188ce659b7c48c114fa98b68d41a0c))

## @backstage-community/plugin-rbac [1.20.7](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.20.6...@backstage-community/plugin-rbac@1.20.7) (2024-05-31)

### Bug Fixes

- **rbac:** show configure-access cta for existing simple permission policies in edit form ([#1702](https://github.com/janus-idp/backstage-plugins/issues/1702)) ([16b7e00](https://github.com/janus-idp/backstage-plugins/commit/16b7e00646153dffd9919f32e57853dbcbd2facb))

## @backstage-community/plugin-rbac [1.20.6](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.20.5...@backstage-community/plugin-rbac@1.20.6) (2024-05-30)

### Bug Fixes

- **rbac:** fix to enable create and edit role buttons on having correct permissions ([#1703](https://github.com/janus-idp/backstage-plugins/issues/1703)) ([19a9088](https://github.com/janus-idp/backstage-plugins/commit/19a908844f48b59116e92091169dd906c45f5621))

## @backstage-community/plugin-rbac [1.20.5](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.20.4...@backstage-community/plugin-rbac@1.20.5) (2024-05-30)

### Bug Fixes

- **rbac:** do not disable already selected rule for allOf/anyOf ([#1739](https://github.com/janus-idp/backstage-plugins/issues/1739)) ([dc73650](https://github.com/janus-idp/backstage-plugins/commit/dc73650587cd13e80923a36473a46e016fae3e81))

## @backstage-community/plugin-rbac [1.20.4](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.20.3...@backstage-community/plugin-rbac@1.20.4) (2024-05-29)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.8.10

## @backstage-community/plugin-rbac [1.20.3](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.20.2...@backstage-community/plugin-rbac@1.20.3) (2024-05-29)

### Bug Fixes

- **rbac:** conditional access form validation ([#1699](https://github.com/janus-idp/backstage-plugins/issues/1699)) ([d56f4af](https://github.com/janus-idp/backstage-plugins/commit/d56f4affd2538c5b9554e19b6ec2951d98d2b218))
- **rbac:** enable save on remove-all button click ([#1712](https://github.com/janus-idp/backstage-plugins/issues/1712)) ([0502332](https://github.com/janus-idp/backstage-plugins/commit/0502332409b092ebc860c9a77d8b966ef920f7bf))
- **rbac:** fix mui autocomplete related warnings ([#1707](https://github.com/janus-idp/backstage-plugins/issues/1707)) ([8e5c5ae](https://github.com/janus-idp/backstage-plugins/commit/8e5c5aef5e0472fdb876d81fc7f2356cfb4319f0))

### Dependencies

- **@janus-idp/shared-react:** upgraded to 2.6.3
- **@janus-idp/cli:** upgraded to 1.8.9

## @backstage-community/plugin-rbac [1.20.2](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.20.1...@backstage-community/plugin-rbac@1.20.2) (2024-05-16)

## @backstage-community/plugin-rbac [1.20.1](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.20.0...@backstage-community/plugin-rbac@1.20.1) (2024-05-16)

### Dependencies

- **@janus-idp/shared-react:** upgraded to 2.6.2
- **@janus-idp/cli:** upgraded to 1.8.7

## @backstage-community/plugin-rbac [1.20.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.19.0...@backstage-community/plugin-rbac@1.20.0) (2024-05-15)

### Features

- **rbac:** support for updating/deleting conditional permissions ([#1628](https://github.com/janus-idp/backstage-plugins/issues/1628)) ([2bb8308](https://github.com/janus-idp/backstage-plugins/commit/2bb8308d53e539023dd87573a66ad25501ada7d1))

## @backstage-community/plugin-rbac [1.19.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.18.2...@backstage-community/plugin-rbac@1.19.0) (2024-05-14)

### Features

- **deps:** use RHDH themes in the backstage app and dev pages ([#1480](https://github.com/janus-idp/backstage-plugins/issues/1480)) ([8263bf0](https://github.com/janus-idp/backstage-plugins/commit/8263bf099736cbb0d0f2316082d338ba81fa6927))

## @backstage-community/plugin-rbac [1.18.2](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.18.1...@backstage-community/plugin-rbac@1.18.2) (2024-05-09)

### Dependencies

- **@backstage-community/plugin-rbac-common:** upgraded to 1.4.2
- **@janus-idp/shared-react:** upgraded to 2.6.1
- **@janus-idp/cli:** upgraded to 1.8.6

## @backstage-community/plugin-rbac [1.18.1](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.18.0...@backstage-community/plugin-rbac@1.18.1) (2024-05-08)

### Bug Fixes

- **rbac:** hide frontend when permission framework was disabled ([#1493](https://github.com/janus-idp/backstage-plugins/issues/1493)) ([5aa012f](https://github.com/janus-idp/backstage-plugins/commit/5aa012f0a35c1ee1269c570e4b5c94032f592559))

## @backstage-community/plugin-rbac [1.18.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.17.11...@backstage-community/plugin-rbac@1.18.0) (2024-05-08)

### Features

- **rbac:** support for adding conditional permissions ([#1588](https://github.com/janus-idp/backstage-plugins/issues/1588)) ([2042244](https://github.com/janus-idp/backstage-plugins/commit/2042244dc31a557d62bfcf6f7eb556c12154430e))

## @backstage-community/plugin-rbac [1.17.11](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.17.10...@backstage-community/plugin-rbac@1.17.11) (2024-05-02)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.8.5

## @backstage-community/plugin-rbac [1.17.10](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.17.9...@backstage-community/plugin-rbac@1.17.10) (2024-05-02)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.8.4

## @backstage-community/plugin-rbac [1.17.9](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.17.8...@backstage-community/plugin-rbac@1.17.9) (2024-04-30)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.8.3

## @backstage-community/plugin-rbac [1.17.8](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.17.7...@backstage-community/plugin-rbac@1.17.8) (2024-04-30)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.8.2

## @backstage-community/plugin-rbac [1.17.7](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.17.6...@backstage-community/plugin-rbac@1.17.7) (2024-04-25)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.8.1

## @backstage-community/plugin-rbac [1.17.6](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.17.5...@backstage-community/plugin-rbac@1.17.6) (2024-04-17)

### Dependencies

- **@backstage-community/plugin-rbac-common:** upgraded to 1.4.1

## @backstage-community/plugin-rbac [1.17.5](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.17.4...@backstage-community/plugin-rbac@1.17.5) (2024-04-15)

### Dependencies

- **@janus-idp/shared-react:** upgraded to 2.6.0
- **@janus-idp/cli:** upgraded to 1.8.0

## @backstage-community/plugin-rbac [1.17.4](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.17.3...@backstage-community/plugin-rbac@1.17.4) (2024-04-09)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.7.10

## @backstage-community/plugin-rbac [1.17.3](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.17.2...@backstage-community/plugin-rbac@1.17.3) (2024-04-09)

### Dependencies

- **@janus-idp/shared-react:** upgraded to 2.5.5

## @backstage-community/plugin-rbac [1.17.2](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.17.1...@backstage-community/plugin-rbac@1.17.2) (2024-04-09)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.7.9

## @backstage-community/plugin-rbac [1.17.1](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.17.0...@backstage-community/plugin-rbac@1.17.1) (2024-04-08)

### Dependencies

- **@janus-idp/shared-react:** upgraded to 2.5.4

## @backstage-community/plugin-rbac [1.17.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.16.2...@backstage-community/plugin-rbac@1.17.0) (2024-04-05)

### Features

- **rbac:** save role modification information to the metadata ([#1280](https://github.com/janus-idp/backstage-plugins/issues/1280)) ([0454509](https://github.com/janus-idp/backstage-plugins/commit/0454509e41db2ae332d1b2bf8f72d34241483efd))

### Dependencies

- **@backstage-community/plugin-rbac-common:** upgraded to 1.4.0
- **@janus-idp/shared-react:** upgraded to 2.5.4
- **@janus-idp/cli:** upgraded to 1.7.8

## @backstage-community/plugin-rbac [1.16.2](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.16.1...@backstage-community/plugin-rbac@1.16.2) (2024-04-04)

### Dependencies

- **@backstage-community/plugin-rbac-common:** upgraded to 1.3.2

## @backstage-community/plugin-rbac [1.16.1](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.16.0...@backstage-community/plugin-rbac@1.16.1) (2024-04-03)

### Documentation

- **rbac:** update to the rbac documentation ([#1433](https://github.com/janus-idp/backstage-plugins/issues/1433)) ([5d96db3](https://github.com/janus-idp/backstage-plugins/commit/5d96db3550690658341425786b6a382ea162faac))

## @backstage-community/plugin-rbac [1.16.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.15.7...@backstage-community/plugin-rbac@1.16.0) (2024-04-03)

### Features

- **rbac:** add conditional access button and sidebar ([#1359](https://github.com/janus-idp/backstage-plugins/issues/1359)) ([448267d](https://github.com/janus-idp/backstage-plugins/commit/448267d017247fbcb595452783e628467a3582fe))

## @backstage-community/plugin-rbac [1.15.7](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.15.6...@backstage-community/plugin-rbac@1.15.7) (2024-04-02)

### Bug Fixes

- **rbac:** align styles with UXD ([#1416](https://github.com/janus-idp/backstage-plugins/issues/1416)) ([1df3592](https://github.com/janus-idp/backstage-plugins/commit/1df3592e298f66db1eda5b21c80aeda99fb2d7ce))

### Dependencies

- **@janus-idp/cli:** upgraded to 1.7.7

## @backstage-community/plugin-rbac [1.15.6](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.15.5...@backstage-community/plugin-rbac@1.15.6) (2024-03-29)

### Dependencies

- **@backstage-community/plugin-rbac-common:** upgraded to 1.3.1
- **@janus-idp/shared-react:** upgraded to 2.5.3
- **@janus-idp/cli:** upgraded to 1.7.6

## @backstage-community/plugin-rbac [1.15.5](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.15.4...@backstage-community/plugin-rbac@1.15.5) (2024-03-26)

### Bug Fixes

- **rbac:** alert display issue after role creating/updating ([#1354](https://github.com/janus-idp/backstage-plugins/issues/1354)) ([2e04ccb](https://github.com/janus-idp/backstage-plugins/commit/2e04ccb0c2853b8b08de671723d421df64d51699))

## @backstage-community/plugin-rbac [1.15.4](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.15.3...@backstage-community/plugin-rbac@1.15.4) (2024-03-25)

### Bug Fixes

- **rbac:** yarn lint command ([#1361](https://github.com/janus-idp/backstage-plugins/issues/1361)) ([459b909](https://github.com/janus-idp/backstage-plugins/commit/459b90985013695fb9626ac9b547cf0627a385be))

### Other changes

- **rbac:** add playwright tests for the plugin ([#1305](https://github.com/janus-idp/backstage-plugins/issues/1305)) ([16d0686](https://github.com/janus-idp/backstage-plugins/commit/16d0686ef8cc0d84d93e9e06d46f23b5bb7d5a1f))

## @backstage-community/plugin-rbac [1.15.3](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.15.2...@backstage-community/plugin-rbac@1.15.3) (2024-03-04)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.7.5

## @backstage-community/plugin-rbac [1.15.2](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.15.1...@backstage-community/plugin-rbac@1.15.2) (2024-02-27)

### Bug Fixes

- **rbac:** fixed autocomplete text input behavior on clear ([#1256](https://github.com/janus-idp/backstage-plugins/issues/1256)) ([cb70ff7](https://github.com/janus-idp/backstage-plugins/commit/cb70ff77fde0013eef58b233de226818617fcf6e))

### Dependencies

- **@janus-idp/cli:** upgraded to 1.7.4

## @backstage-community/plugin-rbac [1.15.1](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.15.0...@backstage-community/plugin-rbac@1.15.1) (2024-02-26)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.7.3

## @backstage-community/plugin-rbac [1.15.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.14.5...@backstage-community/plugin-rbac@1.15.0) (2024-02-26)

### Features

- **rbac:** save and display role description in the frontend ([#1206](https://github.com/janus-idp/backstage-plugins/issues/1206)) ([ff61266](https://github.com/janus-idp/backstage-plugins/commit/ff61266a729d472a0e4ff57cd9d2d6ea2389b820))

## @backstage-community/plugin-rbac [1.14.5](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.14.4...@backstage-community/plugin-rbac@1.14.5) (2024-02-21)

### Bug Fixes

- **rbac:** add test selectors ([#1229](https://github.com/janus-idp/backstage-plugins/issues/1229)) ([dca5f2e](https://github.com/janus-idp/backstage-plugins/commit/dca5f2e4e7db29e522752bd5743f41a83bcb6f32))
- **rbac:** fix labels and dropdowns in dark theme by aligning/downgrading components to MUI v4 ([#1243](https://github.com/janus-idp/backstage-plugins/issues/1243)) ([ad44fa8](https://github.com/janus-idp/backstage-plugins/commit/ad44fa8a445234c1e2be0c6386dd1374feba03b0))

### Dependencies

- **@backstage-community/plugin-rbac-common:** upgraded to 1.3.0
- **@janus-idp/shared-react:** upgraded to 2.5.2
- **@janus-idp/cli:** upgraded to 1.7.2

## @backstage-community/plugin-rbac [1.14.4](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.14.3...@backstage-community/plugin-rbac@1.14.4) (2024-02-20)

### Bug Fixes

- **rbac:** add data-testid, names and aria-label to RBAC UI components ([#1224](https://github.com/janus-idp/backstage-plugins/issues/1224)) ([cabc76d](https://github.com/janus-idp/backstage-plugins/commit/cabc76ddf3a4b810b221de5982adbe403f3e5fac))

## @backstage-community/plugin-rbac [1.14.3](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.14.2...@backstage-community/plugin-rbac@1.14.3) (2024-02-16)

### Bug Fixes

- **rbac:** fix rbac tab route ([#1213](https://github.com/janus-idp/backstage-plugins/issues/1213)) ([218ab45](https://github.com/janus-idp/backstage-plugins/commit/218ab455b3cab5e95b235b4483c7d9bf53ca125e))

## @backstage-community/plugin-rbac [1.14.2](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.14.1...@backstage-community/plugin-rbac@1.14.2) (2024-02-08)

### Bug Fixes

- **rbac:** add test for 0 members in group ([#1189](https://github.com/janus-idp/backstage-plugins/issues/1189)) ([afebb56](https://github.com/janus-idp/backstage-plugins/commit/afebb566b314743fc2e1b2d7b12c74c96841ce26))

## @backstage-community/plugin-rbac [1.14.1](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.14.0...@backstage-community/plugin-rbac@1.14.1) (2024-02-08)

### Bug Fixes

- **rbac:** show 0 if no members in a group ([#1187](https://github.com/janus-idp/backstage-plugins/issues/1187)) ([0410800](https://github.com/janus-idp/backstage-plugins/commit/0410800f55f3fb43b75a144943ea70fc2ceca444))

## @backstage-community/plugin-rbac [1.14.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.13.2...@backstage-community/plugin-rbac@1.14.0) (2024-02-08)

### Features

- **rbac:** use relative links ([#1185](https://github.com/janus-idp/backstage-plugins/issues/1185)) ([9fcab95](https://github.com/janus-idp/backstage-plugins/commit/9fcab95869413f005c3246d0f9cd2b2b5acbe8cb))

## @backstage-community/plugin-rbac [1.13.2](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.13.1...@backstage-community/plugin-rbac@1.13.2) (2024-02-05)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.7.1

## @backstage-community/plugin-rbac [1.13.1](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.13.0...@backstage-community/plugin-rbac@1.13.1) (2024-02-02)

### Bug Fixes

- **rbac:** update the RBAC frontend plugin readme ([#1155](https://github.com/janus-idp/backstage-plugins/issues/1155)) ([8db80b9](https://github.com/janus-idp/backstage-plugins/commit/8db80b921ec83fce0d719f430bbdc77276a0e847))

### Dependencies

- **@backstage-community/plugin-rbac-common:** upgraded to 1.2.1
- **@janus-idp/shared-react:** upgraded to 2.5.1

## @backstage-community/plugin-rbac [1.13.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.12.3...@backstage-community/plugin-rbac@1.13.0) (2024-01-31)

### Features

- **rbac:** turn rbac plugin into a dynamic plugin ([#1133](https://github.com/janus-idp/backstage-plugins/issues/1133)) ([b9b36d5](https://github.com/janus-idp/backstage-plugins/commit/b9b36d5b58b86eed457ffb347af785b3181a9de7))

## @backstage-community/plugin-rbac [1.12.3](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.12.2...@backstage-community/plugin-rbac@1.12.3) (2024-01-30)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.7.0

## @backstage-community/plugin-rbac [1.12.2](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.12.1...@backstage-community/plugin-rbac@1.12.2) (2024-01-30)

### Dependencies

- **@janus-idp/shared-react:** upgraded to 2.5.0

## @backstage-community/plugin-rbac [1.12.1](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.12.0...@backstage-community/plugin-rbac@1.12.1) (2024-01-30)

### Bug Fixes

- **rbac:** watch users and permission-policies ([#1102](https://github.com/janus-idp/backstage-plugins/issues/1102)) ([cec734b](https://github.com/janus-idp/backstage-plugins/commit/cec734b3998e37fce9b7291640beb7fc2d797939))

## @backstage-community/plugin-rbac [1.12.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.11.1...@backstage-community/plugin-rbac@1.12.0) (2024-01-29)

### Features

- **rbac:** disable selected permissions ([#1117](https://github.com/janus-idp/backstage-plugins/issues/1117)) ([00cd501](https://github.com/janus-idp/backstage-plugins/commit/00cd501d6cd587c8a7b151189da30dd8c9865803))

## @backstage-community/plugin-rbac [1.11.1](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.11.0...@backstage-community/plugin-rbac@1.11.1) (2024-01-25)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.6.0

## @backstage-community/plugin-rbac [1.11.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.10.2...@backstage-community/plugin-rbac@1.11.0) (2024-01-24)

### Features

- **rbac:** center align toast ([#1090](https://github.com/janus-idp/backstage-plugins/issues/1090)) ([697c96f](https://github.com/janus-idp/backstage-plugins/commit/697c96f25c220750ae290879e3020ecc1a5f03c5))

## @backstage-community/plugin-rbac [1.10.2](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.10.1...@backstage-community/plugin-rbac@1.10.2) (2024-01-23)

### Bug Fixes

- **rbac:** fix the roles table to also watch policies ([#1057](https://github.com/janus-idp/backstage-plugins/issues/1057)) ([ead78e2](https://github.com/janus-idp/backstage-plugins/commit/ead78e2e96e208ef394497d06452c3f3415af31b))

## @backstage-community/plugin-rbac [1.10.1](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.10.0...@backstage-community/plugin-rbac@1.10.1) (2024-01-18)

### Bug Fixes

- **rbac:** update the rbac ui readme ([#1079](https://github.com/janus-idp/backstage-plugins/issues/1079)) ([145e95b](https://github.com/janus-idp/backstage-plugins/commit/145e95bf47cead017872f130ee1c60f77809ff80))

## @backstage-community/plugin-rbac [1.10.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.9.0...@backstage-community/plugin-rbac@1.10.0) (2024-01-17)

### Features

- **rbac:** allow editing permission policies ([#1037](https://github.com/janus-idp/backstage-plugins/issues/1037)) ([c10347d](https://github.com/janus-idp/backstage-plugins/commit/c10347d1ecaa13d6d786ab51a05c6046530e457c))
- **rbac:** show warning alert when user is not authorised to create roles ([#1064](https://github.com/janus-idp/backstage-plugins/issues/1064)) ([b5c46c8](https://github.com/janus-idp/backstage-plugins/commit/b5c46c8d19a092b8ecef653a48331d844cfb3c8c))

### Bug Fixes

- **rbac:** disable edit when the user is unauthorized to read the catalog-entity ([#1049](https://github.com/janus-idp/backstage-plugins/issues/1049)) ([c4f2969](https://github.com/janus-idp/backstage-plugins/commit/c4f296960f450e29bd8cbd34f5ecbf1aae0f0837))

### Dependencies

- **@janus-idp/shared-react:** upgraded to 2.4.0

## @backstage-community/plugin-rbac [1.9.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.8.0...@backstage-community/plugin-rbac@1.9.0) (2023-12-21)

### Features

- **rbac:** support for adding permission policies to roles ([#1021](https://github.com/janus-idp/backstage-plugins/issues/1021)) ([dd11c3a](https://github.com/janus-idp/backstage-plugins/commit/dd11c3a14eebaea9e8acc43b0c28b338d5fa14c1))

## @backstage-community/plugin-rbac [1.8.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.7.0...@backstage-community/plugin-rbac@1.8.0) (2023-12-20)

### Features

- **rbac:** cleanup policies when a role is deleted ([#1018](https://github.com/janus-idp/backstage-plugins/issues/1018)) ([fb0ee8c](https://github.com/janus-idp/backstage-plugins/commit/fb0ee8c269892f6c2ccaea69754a9dda653d4fcb))

## @backstage-community/plugin-rbac [1.7.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.6.0...@backstage-community/plugin-rbac@1.7.0) (2023-12-15)

### Features

- **rbac:** allow editing roles ([#1001](https://github.com/janus-idp/backstage-plugins/issues/1001)) ([2e81062](https://github.com/janus-idp/backstage-plugins/commit/2e810620ea5641df827dfe83bf7695cf16117033))

## @backstage-community/plugin-rbac [1.6.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.5.1...@backstage-community/plugin-rbac@1.6.0) (2023-12-12)

### Features

- **rbac:** add support for creation of role ([#974](https://github.com/janus-idp/backstage-plugins/issues/974)) ([7cb9cbd](https://github.com/janus-idp/backstage-plugins/commit/7cb9cbdba6076ffc5447e560de197ecd68ba6e40))

## @backstage-community/plugin-rbac [1.5.1](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.5.0...@backstage-community/plugin-rbac@1.5.1) (2023-12-07)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.4.7

## @backstage-community/plugin-rbac [1.5.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.4.0...@backstage-community/plugin-rbac@1.5.0) (2023-12-07)

### Features

- **rbac:** list roles with no permission policies ([#998](https://github.com/janus-idp/backstage-plugins/issues/998)) ([217b7b0](https://github.com/janus-idp/backstage-plugins/commit/217b7b0db3414788c8e77247f378a51cf0eeda0d))

## @backstage-community/plugin-rbac [1.4.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.3.1...@backstage-community/plugin-rbac@1.4.0) (2023-12-05)

### Features

- **rbac:** role overview ([#972](https://github.com/janus-idp/backstage-plugins/issues/972)) ([43c1906](https://github.com/janus-idp/backstage-plugins/commit/43c19064e9477a5449ff5d56b00efe27cf640c27))

### Dependencies

- **@backstage-community/plugin-rbac-common:** upgraded to 1.2.0

## @backstage-community/plugin-rbac [1.3.1](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.3.0...@backstage-community/plugin-rbac@1.3.1) (2023-11-30)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.4.6

## @backstage-community/plugin-rbac [1.3.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.2.4...@backstage-community/plugin-rbac@1.3.0) (2023-11-28)

### Features

- **rbac:** list roles ([#937](https://github.com/janus-idp/backstage-plugins/issues/937)) ([8722056](https://github.com/janus-idp/backstage-plugins/commit/8722056088a3214f6267c621ecc10e3658484a07))

## @backstage-community/plugin-rbac [1.2.4](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.2.3...@backstage-community/plugin-rbac@1.2.4) (2023-11-22)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.4.5

## @backstage-community/plugin-rbac [1.2.3](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.2.2...@backstage-community/plugin-rbac@1.2.3) (2023-11-21)

### Bug Fixes

- sync versions in dynamic assets and publish derived packages as additional packages ([#963](https://github.com/janus-idp/backstage-plugins/issues/963)) ([7d0a386](https://github.com/janus-idp/backstage-plugins/commit/7d0a38609b4a18b54c75378a150e8b5c3ba8ff43))

## @backstage-community/plugin-rbac [1.2.2](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.2.1...@backstage-community/plugin-rbac@1.2.2) (2023-11-20)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.4.4

## @backstage-community/plugin-rbac [1.2.1](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.2.0...@backstage-community/plugin-rbac@1.2.1) (2023-11-16)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.4.3

## @backstage-community/plugin-rbac [1.2.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.1.5...@backstage-community/plugin-rbac@1.2.0) (2023-11-15)

### Features

- **rbac:** display administration to authorized users ([#895](https://github.com/janus-idp/backstage-plugins/issues/895)) ([70ae509](https://github.com/janus-idp/backstage-plugins/commit/70ae509e91e4967f4436a66c69be6040e235be0e))

## @backstage-community/plugin-rbac [1.1.5](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.1.4...@backstage-community/plugin-rbac@1.1.5) (2023-11-13)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.4.2

## @backstage-community/plugin-rbac [1.1.4](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.1.3...@backstage-community/plugin-rbac@1.1.4) (2023-11-13)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.4.1

## @backstage-community/plugin-rbac [1.1.3](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.1.2...@backstage-community/plugin-rbac@1.1.3) (2023-11-07)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.4.0

## @backstage-community/plugin-rbac [1.1.2](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.1.1...@backstage-community/plugin-rbac@1.1.2) (2023-11-06)

### Bug Fixes

- **cli:** add default scalprum config ([#909](https://github.com/janus-idp/backstage-plugins/issues/909)) ([d74fc72](https://github.com/janus-idp/backstage-plugins/commit/d74fc72ab7e0a843da047c7b6570d8a6fbc068e1))

### Dependencies

- **@janus-idp/cli:** upgraded to 1.3.3

## @backstage-community/plugin-rbac [1.1.1](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.1.0...@backstage-community/plugin-rbac@1.1.1) (2023-11-02)

### Dependencies

- **@janus-idp/cli:** upgraded to 1.3.2

## @backstage-community/plugin-rbac [1.1.0](https://github.com/janus-idp/backstage-plugins/compare/@backstage-community/plugin-rbac@1.0.0...@backstage-community/plugin-rbac@1.1.0) (2023-11-01)

### Features

- **dynamic-plugins:** publish dynamic assets for all frontend plugins ([#896](https://github.com/janus-idp/backstage-plugins/issues/896)) ([dcfb0ac](https://github.com/janus-idp/backstage-plugins/commit/dcfb0ac56769c82f6b8b2cef2726251e0b60c375))

## @backstage-community/plugin-rbac 1.0.0 (2023-10-23)

### Features

- **rbac:** add rbac frontend plugin ([#859](https://github.com/janus-idp/backstage-plugins/issues/859)) ([2a64b13](https://github.com/janus-idp/backstage-plugins/commit/2a64b137434ef3f9b685e16eb10b7a579f80cd3d))
