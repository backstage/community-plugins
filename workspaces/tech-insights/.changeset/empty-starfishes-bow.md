---
'@backstage-community/plugin-tech-insights-common': patch
---

Cache identical API calls for a few seconds. This prevents fetching the same checks multiple times when having several Scorecards with the same (or all) checks, although with different filters.
