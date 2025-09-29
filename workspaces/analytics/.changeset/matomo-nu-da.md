---
'@backstage-community/plugin-analytics-module-matomo': patch
---

Added support for Backstage's New Frontend System.

If you're migrating to the new frontend system, you no longer need to wire up an API implementation in `apis.ts`. Instead, pass the module in to the `createApp()` function:

```tsx
import matomoModule from '@backstage-community/plugin-analytics-module-matomo/alpha';

const app = createApp({
  features: [matomoModule],
});
```

This can be skipped if you have feature discovery enabled.
