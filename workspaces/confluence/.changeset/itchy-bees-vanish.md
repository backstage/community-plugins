---
'@backstage-community/plugin-search-backend-module-confluence-collator': patch
---

Option to cache Confluence documents to reduce API calls.

The cache uses document version information, so you can safely set long cache durations (if your cache memory allows it!). You can enable caching with `documentCacheEnabled: true` and adjust the cache duration with `documentCacheTtl` (default to 24h). Since indexing will be faster, you may want to reduce your indexing schedule interval.
