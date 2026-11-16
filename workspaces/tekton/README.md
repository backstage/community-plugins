# Tekton workspace

Backstage community workspace for the Tekton plugin (`@backstage-community/plugin-tekton`).

## Local development

### Full-stack (frontend + backend)

From **`workspaces/tekton`** (workspace root):

```sh
yarn install
yarn start          # NFS frontend + tekton-dev-backend on :3000 / :7007
yarn start:legacy   # legacy frontend + tekton-dev-backend
yarn start:mock     # frontend-only mocks (UI work; no backend)
```

`tekton-dev-backend` serves catalog/auth/permission plus kubernetes-backend with **fixture** PipelineRuns, TaskRuns, and pod logs (no live cluster). That is intentional for local/e2e stability; see `plugins/tekton-dev-backend/src/fixtures`.

> **Note:** `yarn start` inside `plugins/tekton` starts **only** the frontend. Use the workspace root for full-stack.

See [plugins/tekton/CONTRIBUTING.md](./plugins/tekton/CONTRIBUTING.md).

## E2e tests

Playwright runs against the **real frontend + tekton-dev-backend** (not `start:mock`). Locale projects (`en`/`fr`/`it`/`ja`/`de`/`es`) share one backend. Config mirrors RBAC: separate FE/BE `webServer`s, `reuseExistingServer: false`.

| Command                                        | What it runs                              |
| ---------------------------------------------- | ----------------------------------------- |
| `yarn test:e2e:ci` / `yarn playwright test`    | Full-stack, NFS then legacy (all locales) |
| `yarn test:nfs`                                | Full-stack, NFS only                      |
| `yarn test:legacy`                             | Full-stack, legacy only                   |
| `yarn test:nfs --ui` / `yarn test:legacy --ui` | Playwright UI Mode                        |
| `yarn test:nfs --project=en`                   | Single locale, headless                   |

Free `:3000` / `:7007` first when Playwright starts the stack (`reuseExistingServer: false`), or point at an already-running `yarn start` with `PLAYWRIGHT_URL=http://localhost:3000`.

Justified remaining mock: legacy `/missing-permissions` still uses a FE permission deny stub because the allow-all policy cannot express that UI path. Main Tekton views use discovery → kubernetes-backend fixtures.

## Other commands

```sh
yarn test           # unit tests
yarn lint
yarn backstage-repo-tools knip-reports
```
