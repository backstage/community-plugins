# Contributing — ServiceNow frontend

Contributor guide for `@backstage-community/plugin-servicenow`. For install and operator-facing setup, see the [package README](./README.md) and workspace [docs](../../docs/index.md).

## Prerequisites

- Node.js matching the workspace `engines` field in `workspaces/servicenow/package.json`
- Yarn (Berry) as used by this repository
- From `workspaces/servicenow`: `yarn install`

## Dev harness

### Preferred: start frontend and backend together

From the workspace root, start both plugin harnesses (no full Backstage app required):

```bash
# From workspaces/servicenow
yarn start
```

See the [workspace CONTRIBUTING.md](../../CONTRIBUTING.md) for details.

### Frontend-only

```bash
# From workspaces/servicenow
yarn workspace @backstage-community/plugin-servicenow start
```

This uses `dev/` under this package. It is a plugin harness, not a full Backstage application.

## Scoped validation

```bash
# From workspaces/servicenow
yarn workspace @backstage-community/plugin-servicenow test
yarn workspace @backstage-community/plugin-servicenow lint
yarn tsc
```

Shared helpers:

```bash
yarn workspace @backstage-community/plugin-servicenow-common test
```

## Playwright note

Workspace Playwright under `plugins/servicenow/tests/` is **UI mock smoke** against the frontend harness. It is **not** proof of backend integration or live ServiceNow connectivity, and it is not the merge gate for Backstage version-bump trust.

## Smoke checklist (bump / PR review)

1. Frontend package tests pass (includes `ServiceNowBackendClient` discovery/auth coverage).
2. Optional: `yarn start` from the workspace (both harnesses) and exercise the UI.
3. Backend mount and Table API client contracts are covered by `@backstage-community/plugin-servicenow-backend` tests — run those for bump trust.

## When you need something beyond the harnesses

This workspace is **plugin-only**. Do not add `packages/app` or `packages/backend` here.

| Need                                              | Where                                                                |
| ------------------------------------------------- | -------------------------------------------------------------------- |
| Day-to-day frontend / combined smoke              | `yarn start` (both harnesses) or this package `dev/` + scoped tests  |
| Production-like catalog entity page in a full app | A separate consumer Backstage deployment                             |
| Live ServiceNow credential-backed e2e suites      | Outside this workspace (consumer deployment or separate e2e harness) |
