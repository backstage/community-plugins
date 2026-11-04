---
'@backstage-community/plugin-search-backend-module-confluence-collator': patch
---

Fix Confluence collator to stream search results page-by-page instead of buffering the entire result set, and fix a concurrency regression across page boundaries
