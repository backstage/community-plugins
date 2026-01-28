---
'@backstage-community/backstage-plugin-mta-backend': minor
'@backstage-community/backstage-plugin-mta-frontend': minor
'@backstage-community/backstage-plugin-catalog-backend-module-mta-entity-provider': patch
'@backstage-community/backstage-plugin-scaffolder-backend-module-mta': patch
---

### MTA Plugins: OIDC Authentication Migration

Migrated MTA plugins from custom OAuth2 flow to standard OIDC authentication for RHDH compatibility.

**Breaking Changes:**

- MTA frontend now requires OIDC auth provider to be configured in Backstage
- Frontend uses `X-MTA-Authorization` header for passing Keycloak tokens to backend

**New Features:**

- Single Sign-On: Users authenticate once with Keycloak and have MTA access everywhere
- Bridge Factory: Frontend plugin self-registers OIDC API factory for dynamic plugin compatibility
- Improved error handling with user-friendly auth error messages

**Improvements:**

- Removed ~225 lines of legacy OAuth popup/callback code
- Removed database storage for OAuth tokens (no longer needed)
- Simplified backend to forward user's OIDC token directly to MTA Hub
- Cleaned up unused dependencies (knex, jsonwebtoken, openid-client, etc.)
- Scaffolder action simplified to use service account authentication only

**Configuration Required:**

- OIDC auth provider must be configured with MTA Keycloak
- Service account still required for catalog entity provider and scaffolder
