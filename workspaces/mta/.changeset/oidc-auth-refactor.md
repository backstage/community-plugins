---
'@backstage-community/backstage-plugin-mta-frontend': minor
'@backstage-community/backstage-plugin-mta-backend': minor
'@backstage-community/backstage-plugin-catalog-backend-module-mta-entity-provider': patch
'@backstage-community/backstage-plugin-scaffolder-backend-module-mta': patch
---

Migrated to standard Backstage OIDC authentication pattern.

- Frontend now uses `internal.auth.oidc` API for user token retrieval
- Backend extracts MTA token from `X-MTA-Authorization` header
- Removed database storage and service account token refresh logic
- Removed unused dependencies and dead code
- Added config schema definitions for all backend plugins
