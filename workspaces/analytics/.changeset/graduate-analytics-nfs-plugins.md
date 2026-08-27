---
'@backstage-community/plugin-analytics-module-ga4': major
'@backstage-community/plugin-analytics-module-matomo': major
'@backstage-community/plugin-analytics-module-newrelic-browser': major
'@backstage-community/plugin-analytics-provider-segment': major
---

**BREAKING**: The New Frontend System (NFS) analytics modules have been promoted from the `./alpha` subpath to the primary `.` entry point. Legacy frontend exports have been moved to the new `./legacy` subpath.

Migration steps:

- If you were importing from `@backstage-community/plugin-analytics-module-<name>/alpha` (or `@backstage-community/plugin-analytics-provider-segment/alpha`) to use the NFS module, update your imports to the primary package entry point.
- If you were importing from the primary package entry point (the legacy frontend), update your imports to the `./legacy` subpath.

The `./alpha` subpath has been removed because these plugins do not ship translations.

Each provider's `app.analytics` key (`ga4`, `matomo`, `newRelic`, `segment`) is optional, so installing more than one of these plugins does not require configuring all of them.

The Segment analytics implementation is named `analytics:app/segment` in the New Frontend System.
