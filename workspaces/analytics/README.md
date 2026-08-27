# Analytics

This workspace contains plugins for analytics and usage tracking in Backstage.

## Plugins

[analytics-module-ga4](plugins/analytics-module-ga4)
[analytics-module-matomo](plugins/analytics-module-matomo)
[analytics-module-newrelic-browser](plugins/analytics-module-newrelic-browser)
[analytics-provider-segment](plugins/analytics-provider-segment)

## About this workspace

These plugins help track usage and adoption of Backstage.

## How to run

The Analytics workspace uses each plugin's dev app as the primary testing mechanism. You can start the new frontend system (NFS) or the legacy frontend system.

### New frontend system (default)

- Run `yarn install`
- Run `yarn start` and choose a plugin, or start one directly:

```bash
yarn workspace @backstage-community/plugin-analytics-module-ga4 start
```

### Legacy frontend system

```bash
yarn workspace @backstage-community/plugin-analytics-module-ga4 start:legacy
```
