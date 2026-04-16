---
'@backstage-community/plugin-npm': patch
---

Export a new `app` module for translations, which needs to be manually imported:

```tsx
import npmPlugin, {
  npmTranslationsModule,
} from '@backstage-community/plugin-npm/alpha';

// ...

export default createApp({
  features: [
    // ...other plugins
    npmPlugin,
    npmTranslationsModule,
  ],
});
```
