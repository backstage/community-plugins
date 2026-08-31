---
'@backstage-community/plugin-tech-insights-backend': minor
'@backstage-community/plugin-tech-insights-node': minor
---

Add `techInsightsFactInsertServiceRef` and `techInsightsFactInsertServiceFactory`,
a plugin-scoped service for inserting facts and fact schemas directly into the
tech insights store from external backend modules.

**BREAKING**: The default export of `@backstage-community/plugin-tech-insights-backend`
is now a `createBackendFeatureLoader` that bundles `techInsightsPlugin` together
with `techInsightsFactInsertServiceFactory`, rather than `techInsightsPlugin` itself.
This is a drop-in replacement for `backend.add(...)` consumers, but anyone importing
the default export and using it outside of `backend.add` (e.g. custom composition or
tests) should switch to the named `techInsightsPlugin` export.
