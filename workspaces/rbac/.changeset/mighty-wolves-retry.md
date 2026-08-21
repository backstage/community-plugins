---
'@backstage-community/plugin-rbac-backend': minor
---

Conditional policy reconciliation from the conditional policies file now retries plugin permission metadata reads with bounded exponential backoff, so transient startup races (permission metadata routes mounting after RBAC startup) no longer abort the reconcile. The retry window is configurable via `permission.rbac.conditionalMetadataRetry` (`maxAttempts`, `baseDelayMs`, `maxDelayMs`) and defaults to roughly 4 minutes; set `maxAttempts: 1` to restore the previous fail-fast behavior. Metadata reads triggered through the REST API keep failing fast.
