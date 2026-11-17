# Contributing — ServiceNow backend

Contributor guide for `@backstage-community/plugin-servicenow-backend`. For install and operator configuration, see the [package README](./README.md) and [Configuration.md](../../docs/Configuration.md).

## Prerequisites

- Node.js matching the workspace `engines` field in `workspaces/servicenow/package.json`
- Yarn (Berry) as used by this repository
- From `workspaces/servicenow`: `yarn install`

## Dev harness

The backend `dev/` harness mounts this plugin with mock Backstage `auth` / `httpAuth` so local calls do not need a static token in `app-config.yaml`. Do not add `backend.auth.externalAccess` (or similar) for the harness — it is unused here, and in a real app that token is a **service** principal, which `/incidents` does not accept (`allow: ['user']`).

### Preferred: start frontend and backend together

```bash
# From workspaces/servicenow — set ServiceNow env vars first if you need a live instance
yarn start
```

In the frontend, open **ServiceNow (Backend)** (`/servicenow-live`) to hit this plugin. **ServiceNow (Mock)** does not call the backend. See the [workspace CONTRIBUTING.md](../../CONTRIBUTING.md).

### Backend-only

```bash
# From workspaces/servicenow
yarn workspace @backstage-community/plugin-servicenow-backend start
```

Config is loaded from the workspace [`app-config.yaml`](../../app-config.yaml) (and an untracked `app-config.local.yaml` next to it, if present).

`--config` paths are resolved from **this package directory** (`plugins/servicenow-backend/`), not the workspace root. This flag is easy to get wrong:

```bash
# Looks for plugins/servicenow-backend/app-config.yaml — that file is not in this package
yarn workspace @backstage-community/plugin-servicenow-backend start --config app-config.yaml

# Explicit path to the workspace config, if you must pass --config
yarn workspace @backstage-community/plugin-servicenow-backend start \
  --config ../../app-config.yaml
```

Prefer omitting `--config` so the CLI picks up the workspace file.

### Environment setup

Export these variables when you want the backend harness to talk to a ServiceNow instance. Use local-only placeholder values — do not commit secrets. You can also put the same keys in `app-config.local.yaml` next to the workspace `app-config.yaml`; see [Configuration.md](../../docs/Configuration.md).

| Variable              | Purpose                                                          |
| --------------------- | ---------------------------------------------------------------- |
| `SERVICENOW_BASE_URL` | ServiceNow instance URL (e.g. `https://example.service-now.com`) |
| `SERVICENOW_USERNAME` | Basic-auth username for the ServiceNow instance                  |
| `SERVICENOW_PASSWORD` | Basic-auth password for the ServiceNow instance                  |

Example:

```bash
export SERVICENOW_BASE_URL=https://example.service-now.com
export SERVICENOW_USERNAME=test-user
export SERVICENOW_PASSWORD=test-password
```

### Curl smoke (manual)

In this harness, `/health` and `/incidents` can be called without a Backstage `Authorization` header (mock `httpAuth` treats missing credentials as a user). You still need a configured ServiceNow instance for `/incidents` to return tickets.

```bash
curl -sS http://localhost:7007/api/servicenow/health
curl -sS 'http://localhost:7007/api/servicenow/incidents?limit=5'
```

For UI smoke, prefer `yarn start` and the frontend **ServiceNow (Backend)** page. You do not need to scaffold `packages/app` / `packages/backend` in this workspace.

## Scoped validation

```bash
# From workspaces/servicenow
yarn workspace @backstage-community/plugin-servicenow-backend test
yarn workspace @backstage-community/plugin-servicenow-backend lint
yarn tsc
```

Shared library contracts live in `@backstage-community/plugin-servicenow-common`:

```bash
yarn workspace @backstage-community/plugin-servicenow-common test
```

## Smoke checklist (bump / PR review)

1. Backend package tests pass (includes `plugin.integration.test.ts` mount + health).
2. Optional: `yarn start` from the workspace (both harnesses). Hit `/api/servicenow/health` and/or the frontend **ServiceNow (Backend)** page.
3. Do **not** rely on workspace Playwright for backend trust — that suite is frontend UI mock smoke only.

## When you need something beyond the harnesses

This workspace is **plugin-only**. Do not add `packages/app` or `packages/backend` here.

| Need                                              | Where                                                                |
| ------------------------------------------------- | -------------------------------------------------------------------- |
| Day-to-day backend / combined smoke               | `yarn start` (both harnesses) or this package `dev/` + scoped tests  |
| Production-like catalog entity page in a full app | A separate consumer Backstage deployment                             |
| Live ServiceNow credential-backed e2e suites      | Outside this workspace (consumer deployment or separate e2e harness) |
