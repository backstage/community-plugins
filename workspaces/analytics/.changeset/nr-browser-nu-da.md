---
'@backstage-community/plugin-analytics-module-newrelic-browser': patch
---

Added support for Backstage's New Frontend System.

If you're migrating to the new frontend system, you no longer need to wire up an API implementation in `apis.ts`. Instead, pass the module in to the `createApp()` function:

```tsx
import newRelicBrowserModule from '@backstage-community/plugin-analytics-module-newrelic-browser/alpha';

const app = createApp({
  features: [newRelicBrowserModule],
});
```

This can be skipped if you have feature discovery enabled.
