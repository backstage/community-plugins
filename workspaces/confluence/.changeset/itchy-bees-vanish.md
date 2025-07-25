---
'@backstage-community/plugin-search-backend-module-confluence-collator': patch
---

Cache Confluence documents by default to reduce API calls.

The cache uses document version information, so you can safely set long cache durations (if your cache memory allows it!). You can disable caching with `documentCacheEnabled: false` or adjust the cache duration with `documentCacheTtl` (default to 24h). Since indexing will be faster, you may want to reduce your indexing schedule frequency.
