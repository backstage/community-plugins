---
'@backstage-community/plugin-rollbar-backend': minor
---

**BREAKING** The `RollbarApi` now requires the `CacheService` when being constructed.

Also added feature to expire cached Rollbar project state when using the new backend system.
