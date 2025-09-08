---
'@backstage-community/plugin-servicenow-backend': minor
'@backstage-community/plugin-servicenow-common': minor
'@backstage-community/plugin-servicenow': minor
---

Export the catalog entity tab content as `EntityServicenowContent` instead of `ServicenowPage` to align it with the Backstage naming conventions.

The `ServicenowPage` is still exported for now, but marked as **deprecated**. It might be removed or replaced in a future release.
