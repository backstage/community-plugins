# Analytics Module: Segment

This plugin provides an implementation of the Backstage Analytics API for
Segment. Once installed and configured, analytics events will be sent to
Segment as your users navigate and use your Backstage instance.

This plugin contains no other functionality.

## Installation

1. Install the plugin package in your Backstage app:

   ```console
   yarn workspace app add @backstage-community/plugin-analytics-provider-segment
   ```

## Configuration

1. Wire up the API implementation to your App in `packages/app/src/apis.ts`:

   If your App is built using the New Frontend System, it's enough to supply this
   plugin to `createApp()`:

   ```tsx
   import analyticsProviderSegmentPlugin from '@backstage-community/plugin-analytics-provider-segment/alpha';

   const app = createApp({
     features: [analyticsProviderSegmentPlugin],
   });
   ```

   This can be skipped entirely if you have feature discovery enabled.

   For all other Backstage apps, wire up the API implementation like this:

   ```tsx title="packages/app/src/apis.ts"
   /* highlight-add-start */
   import { SegmentAnalytics } from '@backstage-community/plugin-analytics-provider-segment';
   import {
     analyticsApiRef,
     configApiRef,
     identityApiRef,
   } from '@backstage/core-plugin-api';

   /* highlight-add-end */

   export const apis: AnyApiFactory[] = [
     // Other APIs...
     // Instantiate and register the GA Analytics API Implementation.
     /* highlight-add-start */
     createApiFactory({
       api: analyticsApiRef,
       deps: { configApi: configApiRef, identityApi: identityApiRef },
       factory: ({ configApi, identityApi }) =>
         SegmentAnalytics.fromConfig(configApi, { identityApi }),
     }),
     /* highlight-add-end */
   ];
   ```

2. Configure the plugin in your `app-config.yaml`:

The following is the minimum configuration required to start sending analytics
events to Segment. All that's needed is your Segment Write Key

```yaml title="app-config.yaml"
app:
  analytics:
    segment:
      # highlight-start
      writeKey: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
      maskIP: true # prevents IP addresses from being sent if true
      # highlight-end
```

### Version Tracking

To include version information in your analytics events (helpful for version-based filtering in dashboards), you can configure:

```yaml title="app-config.yaml"
app:
  analytics:
    segment:
      writeKey: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
      appVersion: '1.2.3' # Your Backstage app version
      backstageVersion: '1.17.0' # Backstage framework version
```

When configured, these version fields will be included in all analytics events sent to Segment, allowing you to:

- Filter analytics dashboards by app version
- Track feature adoption across different versions
- Monitor user behavior changes between versions
- Create version-specific analytics reports

## Debugging and Testing

In pre-production environments, you may wish to set additional configurations
to turn off reporting to Analytics. You can do so like this:

```yaml title="app-config.yaml"
app:
  analytics:
    segment:
      # highlight-next-line
      testMode: true # prevents data from being sent if true
```

You might commonly set the above in an `app-config.local.yaml` file, which is
normally `gitignore`'d but loaded and merged in when Backstage is bootstrapped.
