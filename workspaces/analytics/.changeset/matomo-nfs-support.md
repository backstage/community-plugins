---
'@backstage-community/plugin-analytics-module-matomo': patch
---

Added support for Backstage's New Frontend System.

If you're migrating to the new frontend system, you no longer need to wire up an API implementation in `apis.ts`. Instead, pass the plugin in to the `createApp()` function:

```tsx
import analyticsProviderMatomoPlugin from '@backstage-community/plugin-analytics-module-matomo/alpha';

const app = createApp({
  features: [analyticsProviderMatomoPlugin],
});
```

This can be skipped if you have feature discovery enabled.
