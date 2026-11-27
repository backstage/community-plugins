# Contributing — Topology frontend plugin

Developer guide for `@backstage-community/plugin-topology`. For operator install and end-user configuration, see [README.md](./README.md).

## Prerequisites

- Node.js **22 or 24** (see workspace `engines` in the workspace root `package.json`)
- Yarn (this workspace has its own `yarn.lock` under `workspaces/topology`)

## Development harness

### Full-stack (recommended for integration)

From the workspace root (`workspaces/topology`):

```bash
yarn start          # NFS FE + topology-dev-backend (foreach, same pattern as RBAC)
yarn start:legacy   # legacy FE + topology-dev-backend
```

Frontend talks to kubernetes-backend on `:7007`. Cluster data is **fixture-backed** in `topology-dev-backend` (no live cluster). Ensure `:3000` / `:7007` are free before `yarn test:nfs` / `--ui`.

### Frontend-only mocks (UI work)

```bash
yarn workspace @backstage-community/plugin-topology start:mock
yarn workspace @backstage-community/plugin-topology start:legacy:mock
```

These use `dev/index.mock.tsx` / `dev/legacy.mock.tsx` with in-browser `MockKubernetes*`. Prefer them for fast UI iteration; Playwright CI does **not** use them. Workload payloads come from `src/__fixtures__/1-deployments` — the same module the backend fixture provider re-exports — so mock and fullstack e2e stay aligned without duplicating data.

Only one frontend `dev/` harness should run at a time on the default plugin port.

Do not commit real cluster credentials.

## Validation commands

From the workspace root (`workspaces/topology`):

```bash
yarn workspace @backstage-community/plugin-topology test
yarn workspace @backstage-community/plugin-topology lint
yarn tsc
yarn test:nfs --project=en    # full-stack Playwright, one locale
```

## What automated tests cover

CI exercises unit tests for plugin APIs, hooks, utils, and UI components, plus Playwright e2e against NFS (`dev/index.tsx`) and legacy (`dev/legacy.tsx`) with **topology-dev-backend** (fixture kubernetes data).

CI does **not** replace reading [Backstage release notes](https://github.com/backstage/backstage/releases) for the `@backstage/*` packages this plugin depends on. After a dependency bump, review those notes and decide whether additional validation is warranted.
