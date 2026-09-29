---
'@backstage-community/plugin-copilot': patch
---

Added a proper page header to the "My Copilot Metrics" personal view, showing the signed-in user's name/avatar via `HeaderMetadataUsers` alongside the page title and description. The header is now rendered by `MyMetricsContent` itself (using the signed-in user's identity) instead of a static header in `MyMetricsPage`.
