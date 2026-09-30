---
'@backstage-community/plugin-catalog-backend-module-keycloak': patch
---

Fix race condition in `ensureTokenValid` when called concurrently with a near-expiry token.

Replaced the shared `refreshTokenPromise` with a per-client `WeakMap` of refresh promises. This ensures that concurrent calls for the same `KeycloakAdminClient` reuse the same in-flight authentication promise, and the promise is cleaned up from the `WeakMap` once the refresh is complete using a `.finally()` block.
