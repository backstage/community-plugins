---
'@backstage-community/plugin-npm': patch
---

Export new app module for translations which needs to manually imported:

```tsx
import npmPlugin, {
  npmTranslationsModule,
} from '@backstage-community/plugin-npm/alpha';
```
