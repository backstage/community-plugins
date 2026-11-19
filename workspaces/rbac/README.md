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

The backend grants the guest user super-user access for local/e2e setup. Roles used by Playwright are created via the REST API in the test `beforeAll` (editable). Default catalog members come from `plugins/rbac/tests/fixtures/catalog-org.yaml` + `examples/org.yaml`.

> **Note:** `yarn start` inside `plugins/rbac` starts **only** the frontend. Use the workspace root for full-stack.

See [plugins/rbac-backend/CONTRIBUTING.md](./plugins/rbac-backend/CONTRIBUTING.md) and [plugins/rbac/CONTRIBUTING.md](./plugins/rbac/CONTRIBUTING.md).

### Large catalog (members modal)

`plugins/rbac/tests/fixtures/large-catalog-org.yaml` (110 users + 10 groups) is **not** in app-config. The last test in `rbac.spec.ts` registers it via `POST /api/catalog/locations`, asserts the modal, then deletes that location (Catalog eagerly removes its entities) and waits until user+group total is ≤100 again so later locale projects keep the dropdown path. The rbac-backend dev harness allows `file` locations for that.

## E2e tests

Playwright runs **`rbac.spec.ts` against the real frontend + backend**. Locale projects (`en`/`fr`/`it`/`ja`/`de`/`es`) share one in-memory backend; seeded and created roles use a `-${locale}` suffix so projects do not collide. Japanese still skips “View details of role” ([RHDHBUGS-2598](https://issues.redhat.com/browse/RHDHBUGS-2598)).

| Command                                     | What it runs                            |
| ------------------------------------------- | --------------------------------------- |
| `yarn test:e2e:ci` / `yarn playwright test` | Full-stack `rbac.spec.ts`, NFS + legacy |
| `yarn test:nfs`                             | Full-stack, NFS only                    |
| `yarn test:legacy`                          | Full-stack, legacy only                 |
| `yarn ui-test` (from `plugins/rbac`)        | Same as `test:nfs --project=en`         |

## Other commands

```sh
yarn test           # unit tests
yarn build:all      # build all packages
yarn lint
yarn backstage-repo-tools knip-reports
```

> The guest user has admin permissions in this dev app for quick setup. For production-like setups, configure dedicated admin users in `app-config.local.yaml`.
