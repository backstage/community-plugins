---
'@backstage-community/plugin-catalog-backend-module-keycloak': patch
'@backstage-community/plugin-auth-backend-module-keycloak-provider': patch
---

Add contributor guides, dev harnesses, and bump-trust test coverage for the Keycloak auth and catalog backend modules.

- Auth: `dev/` harness, browserless OAuth smoke (`login.mjs`), module wiring and auth↔catalog sanitization contract tests
- Catalog: transformer extension-point, schedule contract, batch-failure metrics, and `ensureTokenValid` tests
- Workspace: README index and CONTRIBUTING guides with validation/smoke checklists
