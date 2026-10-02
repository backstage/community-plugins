---
'@backstage-community/plugin-linguist-backend': patch
---

Improved error handling when generating entity languages. Temporary directories are now always cleaned up, even when language analysis fails, which prevents disk from filling up over time. Transient failures while fetching an entity's source are retried with backoff, and an entity is only marked as processed once retries are exhausted so a single failing entity no longer blocks the rest of the processing queue.
