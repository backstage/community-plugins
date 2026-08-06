# RBAC workspace

Backstage community workspace for the RBAC plugin (`@backstage-community/plugin-rbac`).

## Local development

### Full-stack (frontend + backend)

From **`workspaces/rbac`** (workspace root):

```sh
yarn install
yarn start          # legacy dev app + rbac-backend on :3000 / :7007
yarn start:alpha    # New Frontend System dev app + backend
```

The backend dev server uses mocked auth/catalog and loads full-stack e2e seed policies from `plugins/rbac/tests/fixtures/`.

### Frontend-only with mocks (no backend)

From `workspaces/rbac/plugins/rbac`:

```sh
yarn start:mock         # legacy UI with in-browser mockRBACApi
yarn start:alpha:mock   # NFS UI with mocks
```

> **Note:** `yarn start` inside `plugins/rbac` starts **only** the frontend. Use the workspace root for full-stack.

## E2e tests

| Command                 | What it runs                                                            |
| ----------------------- | ----------------------------------------------------------------------- |
| `yarn test:e2e:ci`      | Full-stack read-only tests (`rbac-fullstack.spec.ts`), legacy + alpha   |
| `yarn test:e2e:mock:ci` | Mock comprehensive UI tests (`rbac.spec.ts`), 6 locales, legacy + alpha |
| `yarn playwright test`  | Both suites (CI default when `playwrightTests: true` in `bcp.json`)     |

## Other commands

```sh
yarn test           # unit tests
yarn build:all      # build all packages
yarn backstage-repo-tools knip-reports
```

> The guest user has admin permissions in this dev app for quick setup. For production-like setups, configure dedicated admin users in `app-config.local.yaml`.
