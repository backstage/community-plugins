---
'@backstage-community/plugin-analytics-provider-segment': patch
---

Added support for Backstage's New Frontend System.

If you're migrating to the new frontend system, you no longer need to wire up an API implementation in `apis.ts`. Instead, pass the plugin in to the `createApp()` function:

```tsx
import analyticsProviderSegmentPlugin from '@backstage-community/plugin-analytics-provider-segment/alpha';

const app = createApp({
  features: [analyticsProviderSegmentPlugin],
});
```

This can be skipped if you have feature discovery enabled.
