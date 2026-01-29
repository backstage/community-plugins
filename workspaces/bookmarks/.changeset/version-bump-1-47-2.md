---
'@backstage-community/plugin-bookmarks': minor
---

Backstage version bump to v1.47.2

**Breaking**: The new frontend system export no longer provides `bookmarksTranslationsExtension` due to the [deprecation of `TranslationBlueprint`](https://backstage.io/docs/releases/v1.47.0/#deprecation-and-upcoming-restrictions-of-blueprints-for-app-customization-in-backstagefrontend-plugin-api).

To enable translation support for the npm plugin again you must add this extension to your app (in many cases `App.tsx`):

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
