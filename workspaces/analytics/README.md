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

The Analytics workspace uses each plugin's dev app as the primary testing mechanism.

- Run `yarn install`
- Run `yarn start` and choose a plugin, or start one directly, for example:

```bash
yarn workspace @backstage-community/plugin-analytics-provider-segment start
```

`@backstage-community/plugin-analytics-provider-segment` defaults to the new frontend system. To run its legacy frontend playground:

```bash
yarn workspace @backstage-community/plugin-analytics-provider-segment start:legacy
```
