# @backstage-community/plugin-bookmarks

## 0.8.0

### Minor Changes

- 3ebad56: Backstage version bump to v1.48.2

## 0.7.1

### Patch Changes

- 3525795: Add `aria-label` and `tabindex=0` to the Bookmarks viewer iframe for accessibility

## 0.7.0

### Minor Changes

- 213c128: Backstage version bump to v1.47.2

  **Breaking**: The new frontend system export no longer provides `bookmarksTranslationsExtension` due to the [deprecation of `TranslationBlueprint`](https://backstage.io/docs/releases/v1.47.0/#deprecation-and-upcoming-restrictions-of-blueprints-for-app-customization-in-backstagefrontend-plugin-api).

  To enable translation support for the bookmarks plugin again you must add this extension to your app (in many cases `App.tsx`):

  ```tsx
  import { TranslationBlueprint } from '@backstage/plugin-app-react';

  import bookmarksPlugin, {
    bookmarksTranslations,
  } from '@backstage-community/plugin-bookmarks';

  const bookmarksTranslation = TranslationBlueprint.make({
    name: 'bookmarksTranslation',
    params: {
      resource: bookmarksTranslations,
    },
  });

  export default createApp({
    features: [
      createFrontendModule({
        pluginId: 'app',
        extensions: [
          // ...other extensions
          bookmarksTranslation,
        ],
      }),
      // ...other plugins
      bookmarksPlugin,
    ],
  });
  ```

## 0.6.0

### Minor Changes

- 300e8d8: Backstage version bump to v1.46.2

### Patch Changes

- 5b88ed5: Updated dependency `@mui/x-tree-view` to `8.23.0`.

## 0.5.0

### Minor Changes

- f41ff63: Backstage version bump to v1.45.1

### Patch Changes

- 57c1041: Updated dependency `@mui/x-tree-view` to `8.16.0`.

## 0.4.3

### Patch Changes

- 841373a: Updated dependency `@mui/x-tree-view` to `8.15.0`.
- b62e954: Backstage version bump to v1.44.2

## 0.4.2

### Patch Changes

- 7bdd3de: Updated dependency `@mui/x-tree-view` to `8.14.1`.

## 0.4.1

### Patch Changes

- 90c4aa2: Backstage version bump to v1.44.1

## 0.4.0

### Minor Changes

- dae3e7f: add NFS support
- 64fe6b6: Backstage version bump to v1.44.0

## 0.3.0

### Minor Changes

- 0873af3: Backstage bump to 1.43.2

### Patch Changes

- 4c29f93: Updated dependency `@mui/x-tree-view` to `8.11.3`.

## 0.2.0

### Minor Changes

- c344bc0: Allow links to be added to bookmarks that have different embed and "Open in new tab" URLs

## 0.1.2

### Patch Changes

- 00058f7: Updated dependency `@mui/x-tree-view` to `8.11.1`.

## 0.1.1

### Patch Changes

- 6597245: Updated dependency `@mui/x-tree-view` to `8.11.0`.

## 0.1.0

### Minor Changes

- b01eb10: Initial release
