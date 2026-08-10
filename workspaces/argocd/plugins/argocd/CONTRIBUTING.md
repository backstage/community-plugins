# Contributing — Argo CD frontend plugin

Developer guide for `@backstage-community/plugin-argocd`. For operator install and end-user configuration, see [README.md](./README.md).

## Prerequisites

- Node.js **22 or 24** (see workspace `engines` in the workspace root `package.json`)
- Yarn (this workspace has its own `yarn.lock` under `workspaces/argocd`)

## Development harness

Start this plugin in isolation:

```bash
yarn workspace @backstage-community/plugin-argocd start
```

This serves the frontend plugin via `dev/index.tsx` with mocked Argo CD data for faster iteration. Use it for UI extensions, hooks, and API client work.

Only one frontend `dev/` harness should run at a time on the default plugin port. Backend HTTP work belongs in the [backend harness](../argocd-backend/CONTRIBUTING.md).

### Configuration notes

The `dev/` harness uses fixtures under `dev/__data__/`. Operator-facing config keys (`argocd.appLocatorMethods`, annotations, Kubernetes rollouts) are documented in [README.md](./README.md). Do not commit real credentials.

## Validation commands

From the workspace root (`workspaces/argocd`):

```bash
yarn workspace @backstage-community/plugin-argocd test
yarn workspace @backstage-community/plugin-argocd lint
yarn tsc
```

## What automated tests cover

CI exercises:

- Plugin API factory and routable extensions (`ArgocdDeploymentLifecycle`, `ArgocdDeploymentSummary`)
- API clients (`ArgoCDApiClient`, `ArgoCDInstanceApiClient`)
- Hooks and utils used by the deployment lifecycle/summary UI

CI does **not** replace reading [Backstage release notes](https://github.com/backstage/backstage/releases) for the `@backstage/*` packages this plugin depends on. After a dependency bump, review those notes and decide whether additional validation is warranted.

Backend mount, permissions, and Actions API registration are covered by the [backend package tests](../argocd-backend/CONTRIBUTING.md).

## Optional manual smoke checklist

Use when you change frontend integration code or are reviewing a Backstage version bump:

1. Start this harness and open the plugin UI in the browser (path served by `dev/index.tsx`).
2. Confirm deployment lifecycle / summary surfaces render with fixture data.
3. Full catalog-entity + live Argo CD validation needs the backend running (plugin or full workspace) and a real or overlay Argo CD instance — not a merge gate for every bump PR.

## Full workspace app evaluation

The workspace already ships `packages/app` and `packages/backend`. They are **optional** for cross-plugin smoke (entity page cards with a live backend, RBAC, Playwright).

Default for bump-trust and day-to-day work: plugin `dev/` + scoped automated tests. Do **not** add another full Backstage application to this workspace.

```bash
# Optional — full workspace only when needed
yarn start:backstage
```

## Related packages

- [Argo CD backend plugin](../argocd-backend/CONTRIBUTING.md) — HTTP router, permissions, Actions API (separate `dev/` harness)
