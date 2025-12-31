# Analytics Module: Matomo Analytics

This plugin provides an opinionated implementation of the Backstage Analytics
API for Matomo Analytics. Once installed and configured, analytics events will
be sent to Matomo as your users navigate and use your Backstage instance.

This module is made to work with backstage's built-in analytics plugin. The usage guide to start tracking analytics for your plugins can be found here: https://backstage.io/docs/plugins/analytics/

## Installation

1. Install the plugin package in your Backstage app:

```sh
# From your Backstage root directory
yarn workspace app add @backstage-community/plugin-analytics-module-matomo
```

2. Wire up the API implementation to your App:

If your App is built using the New Frontend System, it's enough to supply this
module to `createApp()`:

```tsx
import matomoModule from '@backstage-community/plugin-analytics-module-matomo/alpha';

const app = createApp({
  features: [matomoModule],
});
```

This can be skipped entirely if you have feature discovery enabled.

For all other Backstage apps, wire up the API implementation like this:

```tsx
// packages/app/src/apis.ts
import {
  analyticsApiRef,
  configApiRef,
  identityApiRef,
} from '@backstage/core-plugin-api';

import { MatomoAnalytics } from '@backstage-community/plugin-analytics-module-matomo';

export const apis: AnyApiFactory[] = [
  // Instantiate and register the Matomo Analytics API Implementation.
  createApiFactory({
    api: analyticsApiRef,
    deps: { configApi: configApiRef },
    factory: ({ configApi }) => MatomoAnalytics.fromConfig(configApi),
  }),
];
```

3. Configure the plugin in your `app-config.yaml`:

The following is the minimum configuration required to start sending analytics
events to Matomo. All that's needed is your Matomo Host and Site Id:

```yaml
# app-config.yaml
app:
  analytics:
    matomo:
      host: ${ANALYTICS_MATOMO_INSTANCE_URL}
      siteId: ${ANALYTICS_MATOMO_SITE_ID}
      identity: optional # disabled|optional|required; enables user tracking (disabled by default)
      sendPlainUserId: optional # if set, do not hash User ID when user tracking is enabled (hashed by default)
      enhancedTracking: true # enables extended tracking (navigate events buffering, identity gating)
      deferInitialPageView: true # only if enhancedTracking=true; defers first PV until identity resolved
```

Additional optional properties:

- identity: "disabled" | "optional" | "required" (default: disabled)
- sendPlainUserId: boolean; if true, raw userEntityRef sent (privacy: consider hashing)
- enhancedTracking: boolean; adds buffering before identity ready & explicit page view handling
- deferInitialPageView: boolean; when enhancedTracking=true, delays initial page view until identity is available

4. Update CSP in your `app-config.yaml`:(optional)

The following is the minimal content security policy required to load scripts from your Matomo Instance.

```yaml
backend:
  csp:
    connect-src: ["'self'", 'http:', 'https:']
    # Add these line below
    script-src: ["'self'", "'unsafe-eval'", '${ANALYTICS_MATOMO_INSTANCE_URL}']
```
