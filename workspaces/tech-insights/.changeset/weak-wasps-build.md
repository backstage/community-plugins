---
'@backstage-community/plugin-tech-insights-backend-module-jsonfc': patch
'@backstage-community/plugin-tech-insights-backend': patch
'@backstage-community/plugin-tech-insights-common': patch
'@backstage-community/plugin-tech-insights-node': patch
---

Deprecates `TechInsightCheck` from the `tech-insights-node` library in favor of `Check` coming from the `tech-insights-common` library.

With this change comes a refactor of `Check` from a type to an interface.

The `TechInsightCheck` interface will be removed from the `tech-insights-node` plugin in it's next major release.

Importing `Check` from `@backstage-community/plugin-tech-insights-common/client` has been deprecated in favor of importing directly from `@backstage-community/plugin-tech-insights-common`.
