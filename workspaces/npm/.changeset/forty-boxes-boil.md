---
'@backstage-community/plugin-npm': minor
---

**Breaking change in the alpha export / New Frontend System adopters**:

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
