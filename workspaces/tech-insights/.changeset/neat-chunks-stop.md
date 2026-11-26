---
'@backstage-community/plugin-tech-insights-common': patch
---

`TechInsightsClient.runBulkChecks` no longer sends a trailing empty chunk when the number of entities is a multiple of the chunk size (750). The backend reads an empty list as every entity with facts, so a request for exactly 750 entities also evaluated, and returned, the whole catalog.
