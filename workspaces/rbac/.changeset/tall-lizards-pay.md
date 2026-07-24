---
'@backstage-community/plugin-rbac-backend': patch
'@backstage-community/plugin-rbac-common': patch
'@backstage-community/plugin-rbac': patch
---

Add CI bump-trust coverage and contributor dev harness documentation for the RBAC plugin family.

**`@backstage-community/plugin-rbac-backend`**

- Add backend `dev/` harness config (`app-config.yaml`) that no longer depends on the workspace root `app-config.yaml`
- Add `startTestBackend` smoke test for `GET /api/permission/roles`
- Add policy contract test locking the documented `superUsers` direct-membership rule
- Add backend-only multi-user manual test fixtures/config under `plugins/rbac-backend/__fixtures__/` and `app-config.multi-user.yaml` (Keycloak realm import, catalog entities, CSV policies)
- Add `CONTRIBUTING.md` with harness, test, and REST smoke guidance

**`@backstage-community/plugin-rbac-common`**

- Add minimal public API contract tests
- Add `CONTRIBUTING.md`

**`@backstage-community/plugin-rbac`**

- Add `CONTRIBUTING.md` and link it from the plugin README

**Workspace**

- Remove non-functional root `yarn start` and `yarn start:alpha` scripts that paired separate plugin dev servers
