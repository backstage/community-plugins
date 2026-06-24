---
'@backstage-community/plugin-catalog-backend-module-keycloak': patch
'@backstage-community/plugin-auth-backend-module-keycloak-provider': patch
---

Add contributor guides, dev harnesses, and bump-trust test coverage for the Keycloak auth and catalog backend modules.

- Auth: `dev/` harness, browserless OAuth smoke (`login.py`), module wiring and auth↔catalog sanitization contract tests
- Catalog: transformer extension-point, schedule contract, batch-failure metrics, and `ensureTokenValid` tests
- Workspace: `export-dev-env-from-realm.sh`, README index, and CONTRIBUTING guides with validation/smoke checklists
