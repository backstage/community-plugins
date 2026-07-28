---
'@backstage-community/plugin-catalog-backend-module-keycloak': patch
---

Fix race condition in `ensureTokenValid` when called concurrently with a near-expiry token.

Previously, concurrent calls each overwrote the shared `refreshTokenPromise` with a new `authenticate()` call, causing multiple simultaneous refreshes to Keycloak and leaving earlier promises un-awaited. Replaced `=` with `??=` (nullish coalescing assignment) so the first caller creates the refresh promise and subsequent concurrent callers reuse the same in-flight promise instead of starting new ones.
