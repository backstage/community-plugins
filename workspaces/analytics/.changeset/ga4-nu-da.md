---
'@backstage-community/plugin-analytics-module-ga4': patch
---

Added support for Backstage's New Frontend System.

If you're migrating to the new frontend system, you no longer need to wire up an API implementation in `apis.ts`. Instead, pass the module in to the `createApp()` function:

```tsx
import ga4Module from '@backstage-community/plugin-analytics-module-ga4/alpha';

const app = createApp({
  features: [ga4Module],
});
```

This can be skipped if you have feature discovery enabled.
