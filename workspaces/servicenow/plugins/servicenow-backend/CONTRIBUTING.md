# Contributing — ServiceNow backend

Contributor guide for `@backstage-community/plugin-servicenow-backend`. For install and operator configuration, see the [package README](./README.md) and [Configuration.md](../../docs/Configuration.md).

## Prerequisites

- Node.js matching the workspace `engines` field in `workspaces/servicenow/package.json`
- Yarn (Berry) as used by this repository
- From `workspaces/servicenow`: `yarn install`

## Dev harness

### Preferred: start frontend and backend together

From the workspace root, start both plugin harnesses (no full Backstage app required):

```bash
# From workspaces/servicenow — export ServiceNow env vars first if you need a live instance
yarn start
```

See the [workspace CONTRIBUTING.md](../../CONTRIBUTING.md) for details.

### Backend-only

```bash
# From workspaces/servicenow
yarn workspace @backstage-community/plugin-servicenow-backend start \
  --config app-config.yaml
```

(`--config` paths are resolved from the plugins directory.)

[`app-config.yaml`](./app-config.yaml) in this package is the **minimal** config for the harness (listen port and ServiceNow keys). Prefer starting with `--config app-config.yaml` when running the backend package alone.

By default (without `--config`), `yarn start` on the package loads the fuller [`../../app-config.yaml`](../../app-config.yaml) from the workspace root instead. Optional overrides can go in an untracked `app-config.local.yaml` next to whichever config file you pass.

### Environment setup

Export these variables when you want the backend harness to talk to a ServiceNow instance. Use local-only placeholder values — do not commit secrets.

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

`/incidents` requires **user** credentials (`httpAuth` with `allow: ['user']`). A static `backend.auth.externalAccess` token is a **service** principal and will not satisfy that check — do not widen the allow list without maintainer agreement.

For backend-only curl, the unauthenticated health route is practical:

```bash
curl -sS http://localhost:7007/api/servicenow/health
```

For UI / incident smoke, prefer `yarn start` so both harnesses run together (see workspace guide). You do not need to scaffold `packages/app` / `packages/backend` in this workspace.

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
2. Optional: `yarn start` from the workspace (both harnesses) and exercise the UI / hit `/api/servicenow/health`.
3. Do **not** rely on workspace Playwright for backend trust — that suite is frontend UI mock smoke only.

## When you need something beyond the harnesses

This workspace is **plugin-only**. Do not add `packages/app` or `packages/backend` here.

| Need                                              | Where                                                                |
| ------------------------------------------------- | -------------------------------------------------------------------- |
| Day-to-day backend / combined smoke               | `yarn start` (both harnesses) or this package `dev/` + scoped tests  |
| Production-like catalog entity page in a full app | A separate consumer Backstage deployment                             |
| Live ServiceNow credential-backed e2e suites      | Outside this workspace (consumer deployment or separate e2e harness) |
