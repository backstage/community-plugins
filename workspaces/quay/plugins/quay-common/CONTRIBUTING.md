# Contributing — Quay common library

Developer guide for `@backstage-community/plugin-quay-common`. For package overview, see [README.md](./README.md).

## Prerequisites

- Node.js **22 or 24** (see workspace `engines` in the workspace root `package.json`)
- Yarn (workspace uses its own `yarn.lock`; run commands from `workspaces/quay`)

## Development harness

This is a **common library** (permissions and shared constants). It has no standalone `dev/` server.

Validate changes through:

- Package unit tests (permission contract)
- Dependent plugin harnesses: [quay-backend](../quay-backend/CONTRIBUTING.md) and [quay](../quay/CONTRIBUTING.md)

## Validation commands

From the workspace root (`workspaces/quay`):

```bash
yarn workspace @backstage-community/plugin-quay-common test
yarn workspace @backstage-community/plugin-quay-common lint
yarn tsc
```

## What automated tests cover

CI exercises:

- **Permission contract** — `quayViewPermission` name/attributes and membership in `quayPermissions`

CI does **not** replace reading [Backstage release notes](https://github.com/backstage/backstage/releases) for shared `@backstage/*` permission packages. After a dependency bump, review those notes and decide whether additional validation is warranted.

## Optional manual smoke checklist

Use when you change permission exports or are reviewing a Backstage version bump that touches permission APIs:

1. Run the package tests above.
2. Start the [backend harness](../quay-backend/CONTRIBUTING.md) and confirm DENY/ALLOW behavior still matches `quay.view.read` policy expectations.

## When a consumer app or overlays are needed

- Day-to-day and bump PRs: unit tests + dependent plugin `dev/` harnesses.
- Workspace `packages/app` / `packages/backend` are leftover stubs and are **not** the default path; do not expand them for bump trust.

## Related packages

- [Quay backend](../quay-backend/CONTRIBUTING.md) — registers `quayPermissions` and enforces `quayViewPermission`
- [Quay frontend](../quay/CONTRIBUTING.md) — UI consumers of shared constants
- [Quay scaffolder actions](../quay-actions/CONTRIBUTING.md) — template actions
