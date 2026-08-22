# Contributing — Quay frontend plugin

Developer guide for `@backstage-community/plugin-quay`. For operator install and configuration, see [README.md](./README.md).

## Prerequisites

- Node.js **22 or 24** (see workspace `engines` in the workspace root `package.json`)
- Yarn (workspace uses its own `yarn.lock`; run commands from `workspaces/quay`)

## Development harness

Start the frontend plugin harness:

```bash
yarn workspace @backstage-community/plugin-quay start
```

This uses `dev/index.tsx` (new frontend system). For the legacy frontend entry, see `dev/legacy.tsx`.

The default harness registers a `MockQuayApiClient` and catalog fixtures under `dev/__data__/`, so you can smoke the entity page and tag UI **without** starting the backend plugin. That is enough for a quick local check of layout, navigation, and mocked tag/security/label data.

For live Quay API smoke through the real backend (or proxy), also start the [backend harness](../quay-backend/CONTRIBUTING.md) (port **7007**) and use a client wired to that backend instead of the mock. Only one backend `dev/` harness should run on **7007** at a time.

### Environment setup

Configure Quay via the workspace [`app-config.yaml`](../../app-config.yaml) or an untracked `app-config.local.yaml`. Use local-only placeholder values — do not commit secrets.

| Config key                                      | Purpose                                                    |
| ----------------------------------------------- | ---------------------------------------------------------- |
| `quay.apiUrl` / `quay.proxyPath` / `quay.uiUrl` | Single-instance frontend client config                     |
| `quay.instances`                                | Multi-instance list — do not mix with single-instance keys |
| Entity annotation (see operator README)         | Org/repo (and optional instance) on the catalog entity     |

## Validation commands

From the workspace root (`workspaces/quay`):

```bash
yarn workspace @backstage-community/plugin-quay test
yarn workspace @backstage-community/plugin-quay lint
yarn tsc
```

## What automated tests cover

CI exercises:

- **API factory / config contract** — including mixed single- and multi-instance config throw
- **Hooks** — `useTags` / related hooks with realistic API response shapes
- **Components** — repository and tag page unit coverage

CI does **not** replace reading [Backstage release notes](https://github.com/backstage/backstage/releases) for the `@backstage/*` packages this plugin depends on. After a dependency bump, review those notes and decide whether additional validation is warranted.

## Optional manual smoke checklist

Use when you change frontend integration code or are reviewing a Backstage version bump:

1. Start this frontend harness alone and open a mock Quay entity (for example `quay-instance` / `quay-instance-devel`). Confirm the tag list and related views render from the fixtures in `dev/__data__/`.
2. For live API / permissions smoke, start the [backend harness](../quay-backend/CONTRIBUTING.md) as well and confirm the tag list loads against a real Quay config (or a clear error when config/permissions fail).
3. Exhaustive entity-page matrices and credential-backed e2e belong in a consumer app or overlays — not required for bump PR merge gates.

## When a consumer app or overlays are needed

- Day-to-day and bump PRs: plugin `dev/` harnesses + automated tests.
- Workspace `packages/app` / `packages/backend` are leftover stubs and are **not** the default path; do not expand them for bump trust.
- Live Quay tenant / overlay Playwright: consumer RHDH deployment or `rhdh-plugin-export-overlays`.

## Related packages

- [Quay backend](../quay-backend/CONTRIBUTING.md) — API + permissions
- [Quay common](../quay-common/CONTRIBUTING.md) — shared permission contracts
- [Quay scaffolder actions](../quay-actions/CONTRIBUTING.md) — template actions
