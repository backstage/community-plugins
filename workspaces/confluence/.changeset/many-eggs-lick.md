---
'@backstage-community/plugin-search-backend-module-confluence-collator': patch
---

Lowercase the document type passed to the collator factory to prevent OpenSearch invalid_index_name_exception in multi-instance configurations
