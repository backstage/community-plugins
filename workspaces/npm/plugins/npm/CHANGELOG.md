# @backstage-community/plugin-npm

## 1.18.0

### Minor Changes

- 3f67411: Backstage version bump to v1.48.1

### Patch Changes

- Updated dependencies [3f67411]
  - @backstage-community/plugin-npm-common@1.18.0

## 1.17.0

### Minor Changes

- c235037: **Breaking change in the alpha export / New Frontend System adopters**:

  Backstage v1.47.0 [deprecates](https://backstage.io/docs/releases/v1.47.0#deprecation-and-upcoming-restrictions-of-blueprints-for-app-customization-in-backstagefrontend-plugin-api) `TranslationBlueprint` in `@backstage/frontend-plugin-api` and that plugins can add translation resource to their own extensions list.

  The `npm` plugin is following this and doesn't export an `npmTranslation` extension anymore.

  It also doesn't add the `TranslationBlueprint` to the plugin extensions anymore.

  To enable translation support for the npm plugin again you must add this extension to your app (in many cases `App.tsx`):

  ```tsx
  import { TranslationBlueprint } from '@backstage/plugin-app-react';

  import npmPlugin, {
    npmTranslations,
  } from '@backstage-community/plugin-npm/alpha';

  const npmTranslation = TranslationBlueprint.make({
    name: 'npmTranslation',
    params: {
      resource: npmTranslations,
    },
  });

  export default createApp({
    features: [
      createFrontendModule({
        pluginId: 'app',
        extensions: [
          // ...other extensions
          npmTranslation,
        ],
      }),
      // ...other plugins
      npmPlugin,
    ],
  });
  ```

- c235037: Backstage version bump to v1.47.2

### Patch Changes

- Updated dependencies [c235037]
  - @backstage-community/plugin-npm-common@1.17.0

## 1.16.0

### Minor Changes

- d4dad74: Backstage version bump to v1.46.2

### Patch Changes

- Updated dependencies [d4dad74]
  - @backstage-community/plugin-npm-common@1.16.0

## 1.15.0

### Minor Changes

- 8716cb6: Backstage version bump to v1.45.1

### Patch Changes

- Updated dependencies [8716cb6]
  - @backstage-community/plugin-npm-common@1.15.0

## 1.14.0

### Minor Changes

- 945db23: This version changes the translation import from `@backstage/core-plugin-api/alpha` to the new frontend system import `@backstage/frontend-plugin-api` and exports now a TranslationBlueprint also in the NFS `/alpha` export.

### Patch Changes

- @backstage-community/plugin-npm-common@1.14.0

## 1.13.0

### Minor Changes

- bb724ca: Backstage version bump to v1.44.0

### Patch Changes

- Updated dependencies [bb724ca]
  - @backstage-community/plugin-npm-common@1.13.0

## 1.12.0

### Minor Changes

- fcd92b0: Backstage version bump to v1.43.2

### Patch Changes

- Updated dependencies [fcd92b0]
  - @backstage-community/plugin-npm-common@1.12.0

## 1.11.0

### Minor Changes

- 3bf54c8: Backstage version bump to v1.42.3

### Patch Changes

- Updated dependencies [3bf54c8]
  - @backstage-community/plugin-npm-common@1.11.0

## 1.10.1

### Patch Changes

- bff3611: Remove unused @backstage/catalog-client dependency from the backend and other test devDependencies
- 4d64513: Export `npmTranslationRef` and `npmTranslations` also in the stable/'old' frontend system build.
- Updated dependencies [bff3611]
  - @backstage-community/plugin-npm-common@1.10.1

## 1.10.0

### Minor Changes

- e5c0edf: Backstage version bump to v1.41.1

### Patch Changes

- Updated dependencies [e5c0edf]
  - @backstage-community/plugin-npm-common@1.10.0

## 1.9.0

### Minor Changes

- 9df5e2a: Add new npm registry option `extraRequestHeaders` to pass for example non-standard authentification headers.

### Patch Changes

- Updated dependencies [9df5e2a]
  - @backstage-community/plugin-npm-common@1.9.0

## 1.8.0

### Minor Changes

- 4bfc2ec: Backstage version bump to v1.40.1

### Patch Changes

- Updated dependencies [4bfc2ec]
  - @backstage-community/plugin-npm-common@1.8.0

## 1.7.0

### Minor Changes

- c42ca51: Backstage version bump to v1.39.1

### Patch Changes

- Updated dependencies [c42ca51]
  - @backstage-community/plugin-npm-common@1.7.0

## 1.6.1

### Patch Changes

- c33ba27: Improve error handling when the npm plugin is used without the existing `isNpmAvailable` condition for catalog entities and without the `npm/package` annotation. A generic error was shown instead of the expected missing annotation component (`MissingAnnotationEmptyState`).

## 1.6.0

### Minor Changes

- bd99a7e: Backstage version bump to v1.38.1

### Patch Changes

- Updated dependencies [bd99a7e]
  - @backstage-community/plugin-npm-common@1.6.0

## 1.5.1

### Patch Changes

- c1bcca6: Update docs to install correct npm backend plugin

## 1.5.0

### Minor Changes

- 2adb0e5: Backstage version bump to v1.37.1

### Patch Changes

- Updated dependencies [2adb0e5]
  - @backstage-community/plugin-npm-common@1.5.0

## 1.4.0

### Minor Changes

- 7bbeaca: Add translation support and demo translation for German
- b1fc69d: Change overview card links from html links to Backstage Links to make them more readable and enable analytics support.
- 841f97f: Backstage version bump to v1.36.1

### Patch Changes

- 6819636: Add missing backend api ref to alpha export to support private or alternative npm registries also with the new frontend system.
- Updated dependencies [841f97f]
  - @backstage-community/plugin-npm-common@1.4.0

## 1.3.0

### Minor Changes

- 4b7f4b6: Backstage version bump to 1.35

### Patch Changes

- Updated dependencies [4b7f4b6]
  - @backstage-community/plugin-npm-common@1.3.0

## 1.2.0

### Minor Changes

- 5c776e6: Added support for custom and private npm registries like GitHub and GitLab via a new backend plugin. Other npm registries that works with the npm cli should work as well.

### Patch Changes

- Updated dependencies [5c776e6]
  - @backstage-community/plugin-npm-common@1.2.0

## 1.1.0

### Minor Changes

- 1271dac: add support for the new frontend-system (alpha)
- 9dd37d9: Backstage version bump to v1.34.2

## 1.0.2

### Patch Changes

- fa1521c: export deprecated card components to be backward compatible

## 1.0.1

### Patch Changes

- 12d5926: Add standalone demo application

## 1.0.0

### Major Changes

- 394506b: Initial version that shows meta info and latest versions from a npm registry
