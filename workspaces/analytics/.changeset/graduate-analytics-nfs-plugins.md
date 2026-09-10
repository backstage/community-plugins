---
'@backstage-community/plugin-analytics-provider-segment': major
---

**BREAKING**: The New Frontend System (NFS) Segment analytics module has been promoted from the `./alpha` subpath to the primary `.` entry point. Legacy frontend exports have been moved to the new `./legacy` subpath.

Migration steps:

- If you were importing from `@backstage-community/plugin-analytics-provider-segment/alpha` to use the NFS module, update your imports to `@backstage-community/plugin-analytics-provider-segment`.
- If you were importing from `@backstage-community/plugin-analytics-provider-segment` (the legacy frontend), update your imports to `@backstage-community/plugin-analytics-provider-segment/legacy`.
- The no-op `analyticsModuleSegment` plugin export has been removed. Legacy apps should wire analytics using `SegmentAnalyticsApi` or `SegmentAnalytics.fromConfig()` instead.

The `./alpha` subpath has been removed because this plugin does not ship translations.

The Segment analytics implementation is named `analytics:app/segment` in the New Frontend System.
