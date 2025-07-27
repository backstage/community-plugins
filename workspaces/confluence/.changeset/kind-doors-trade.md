---
'@backstage-community/plugin-search-backend-module-confluence-collator': patch
---

Refined CQL query generation in the Confluence collator to correctly handle combinations of 'spaces' and 'query' parameters, preventing invalid queries when 'spaces' is empty but 'query' is present. Updated tests and documentation accordingly.
