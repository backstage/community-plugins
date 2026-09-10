# RBAC — Backstage community-plugins workspace

Backstage community workspace for the RBAC plugin (`@backstage-community/plugin-rbac`).

Publishable packages live under `plugins/` (`rbac`, `rbac-backend`, `rbac-common`, `rbac-node`).

## Local development

### Full-stack (frontend + backend)

From **`workspaces/rbac`** (workspace root):

```sh
yarn install
yarn start          # NFS (New Frontend System) + rbac-backend on :3000 / :7007
yarn start:legacy   # legacy frontend + rbac-backend
```

The backend grants the guest user super-user access for local/e2e setup. Roles used by Playwright are created via the REST API in the test `beforeAll` (editable). Catalog entities for the member picker live in `plugins/rbac/tests/fixtures/catalog-org.yaml`.

### Frontend-only with mocks (manual UI)

From `workspaces/rbac/plugins/rbac`:

```sh
yarn start:mock          # NFS UI with in-browser mockRBACApi
yarn start:legacy:mock   # legacy UI with mocks
```

> **Note:** `yarn start` inside `plugins/rbac` starts **only** the frontend. Use the workspace root for full-stack.

See [plugins/rbac-backend/CONTRIBUTING.md](./plugins/rbac-backend/CONTRIBUTING.md) and [plugins/rbac/CONTRIBUTING.md](./plugins/rbac/CONTRIBUTING.md).

## E2e tests

Playwright runs **`rbac.spec.ts` against the real frontend + backend** (no mock API). Locale projects (`en`/`fr`/`it`/`ja`/`de`/`es`) share one in-memory backend; seeded and created roles use a `-${locale}` suffix so projects do not collide. Japanese still skips “View details of role” ([RHDHBUGS-2598](https://issues.redhat.com/browse/RHDHBUGS-2598)).

| Command                                     | What it runs                                          |
| ------------------------------------------- | ----------------------------------------------------- |
| `yarn test:e2e:ci` / `yarn playwright test` | Full-stack `rbac.spec.ts`, NFS + legacy (all locales) |
| `yarn test:nfs`                             | Full-stack, NFS only                                  |
| `yarn test:legacy`                          | Full-stack, legacy only                               |
| `yarn ui-test` (from `plugins/rbac`)        | Same as `test:nfs --project=en`                       |

## Other commands

```sh
yarn test           # unit tests
yarn build:all      # build all packages
yarn lint
yarn backstage-repo-tools knip-reports
```

> The guest user has admin permissions in this dev app for quick setup. For production-like setups, configure dedicated admin users in `app-config.local.yaml`.
