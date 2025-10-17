## @janus-idp/backstage-scaffolder-backend-module-annotator [1.3.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-scaffolder-backend-module-annotator@1.2.1...@janus-idp/backstage-scaffolder-backend-module-annotator@1.3.0) (2024-07-25)

## 2.11.0

### Minor Changes

- 756bbf3: Backstage version bump to v1.44.1

## 2.10.0

### Minor Changes

- af7e136: Backstage version bump to v1.42.5

## 2.9.0

### Minor Changes

- 4b2153a: Backstage version bump to v1.41.1

## 2.8.0

### Minor Changes

- 68a0e98: Adds a new scaffolder action to the scaffolder-backend-module-annotator to faciliate better lifecycle management when used alongside the `catalog:scaffolded-from` scaffolder action.

  The `catalog:template:version` scaffolder action can be used to annotate the entities that a template generates using the annotation `backstage.io/template-version`. The versioning information can either come from the template itself (as an annotation) or be passed as input to the new action.

  Also included in the changes are template examples for all scaffolder actions included in the scaffolder-backend-module-annotator plugin.

### Patch Changes

- 6a59fcf: remove support and lifecycle keywords in package.json

## 2.7.0

### Minor Changes

- fb16cf3: Backstage version bump to v1.39.0

## 2.6.0

### Minor Changes

- 542f931: Backstage version bump to v1.38.1

## 2.5.1

### Patch Changes

- 973a5ef: remove prettier from devDevpendencies

## 2.5.0

### Minor Changes

- 44a8a93: Backstage version bump to v1.36.1

## 2.4.0

### Minor Changes

- 8f6bb57: Backstage version bump to v1.35.1

## 2.3.0

### Minor Changes

- bb9a4f7: Backstage version bump to v1.34.2

## 2.2.3

### Patch Changes

- 0f5c451: Updated dependency `prettier` to `3.4.2`.

## 2.2.2

### Patch Changes

- b6fe90f: The [scaffolder-backend-module-annotator](https://github.com/janus-idp/backstage-plugins/tree/main/plugins/scaffolder-annotator-action) plugin from the [janus-idp/backstage-plugins](https://github.com/janus-idp/backstage-plugins) repository was migrated to the [community plugins](https://github.com/backstage/community-plugins), based on commit `9671df5d`.

  The migration was performed by following the manual migration steps outlined in the [Community Plugins CONTRIBUTING guide](https://github.com/backstage/community-plugins/blob/main/CONTRIBUTING.md#migrating-a-plugin).

## 2.2.1

### Patch Changes

- 0e6bfd3: feat: update Backstage to the latest version

  Update to Backstage 1.32.5

## 2.2.0

### Minor Changes

- 8244f28: chore(deps): update to backstage 1.32

## 2.1.1

### Patch Changes

- 7342e9b: chore: remove @janus-idp/cli dep and relink local packages

  This update removes `@janus-idp/cli` from all plugins, as it’s no longer necessary. Additionally, packages are now correctly linked with a specified version.

## 2.1.0

### Minor Changes

- d9551ae: feat(deps): update to backstage 1.31

### Patch Changes

- d9551ae: upgrade to yarn v3
- d9551ae: Change the export-dynamic script to no longer use any flags and remove the tracking of the dist-dynamic folder

### Features

- **deps:** update to backstage 1.29 ([#1900](https://github.com/janus-idp/backstage-plugins/issues/1900)) ([f53677f](https://github.com/janus-idp/backstage-plugins/commit/f53677fb02d6df43a9de98c43a9f101a6db76802))

## @janus-idp/backstage-scaffolder-backend-module-annotator [1.2.1](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-scaffolder-backend-module-annotator@1.2.0...@janus-idp/backstage-scaffolder-backend-module-annotator@1.2.1) (2024-07-24)

### Bug Fixes

- **deps:** rollback unreleased plugins ([#1951](https://github.com/janus-idp/backstage-plugins/issues/1951)) ([8b77969](https://github.com/janus-idp/backstage-plugins/commit/8b779694f02f8125587296305276b84cdfeeaebe))

## @janus-idp/backstage-scaffolder-backend-module-annotator [1.2.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-scaffolder-backend-module-annotator@1.1.0...@janus-idp/backstage-scaffolder-backend-module-annotator@1.2.0) (2024-07-22)

### Features

- **deps:** update to backstage 1.28 ([#1891](https://github.com/janus-idp/backstage-plugins/issues/1891)) ([1ba1108](https://github.com/janus-idp/backstage-plugins/commit/1ba11088e0de60e90d138944267b83600dc446e5))

## @janus-idp/backstage-scaffolder-backend-module-annotator [1.1.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-scaffolder-backend-module-annotator@1.0.3...@janus-idp/backstage-scaffolder-backend-module-annotator@1.1.0) (2024-06-13)

### Features

- **deps:** update to backstage 1.27 ([#1683](https://github.com/janus-idp/backstage-plugins/issues/1683)) ([a14869c](https://github.com/janus-idp/backstage-plugins/commit/a14869c3f4177049cb8d6552b36c3ffd17e7997d))

## @janus-idp/backstage-scaffolder-backend-module-annotator [1.0.3](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-scaffolder-backend-module-annotator@1.0.2...@janus-idp/backstage-scaffolder-backend-module-annotator@1.0.3) (2024-06-13)

### Bug Fixes

- missing postversion script is several plugins and missing turbo dependency ([#1811](https://github.com/janus-idp/backstage-plugins/issues/1811)) ([4dfe4f5](https://github.com/janus-idp/backstage-plugins/commit/4dfe4f533e21e79c928c66bfd68684243912be2c))

## @janus-idp/backstage-scaffolder-backend-module-annotator [1.0.2](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-scaffolder-backend-module-annotator@1.0.1...@janus-idp/backstage-scaffolder-backend-module-annotator@1.0.2) (2024-06-04)

## @janus-idp/backstage-scaffolder-backend-module-annotator [1.0.1](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-scaffolder-backend-module-annotator@1.0.0...@janus-idp/backstage-scaffolder-backend-module-annotator@1.0.1) (2024-05-31)

### Bug Fixes

- **scaffolder:** update annotator action readme ([#1638](https://github.com/janus-idp/backstage-plugins/issues/1638)) ([8e3af1b](https://github.com/janus-idp/backstage-plugins/commit/8e3af1b91b1cc874d4e867717eef1dc9eca592fc))

## @janus-idp/backstage-scaffolder-backend-module-annotator 1.0.0 (2024-05-09)

### Features

- **scaffolder:** create custom action for scaffolder templates ([#1567](https://github.com/janus-idp/backstage-plugins/issues/1567)) ([e30701e](https://github.com/janus-idp/backstage-plugins/commit/e30701ec9c0ba09ad56cbc23fb7f8a8cb9c561c9))
