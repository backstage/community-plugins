# Contributing — Quay scaffolder backend module

Developer guide for `@backstage-community/plugin-scaffolder-backend-module-quay`. For operator install and configuration, see [README.md](./README.md).

## Prerequisites

- Node.js **22 or 24** (see workspace `engines` in the workspace root `package.json`)
- Yarn (workspace uses its own `yarn.lock`; run commands from `workspaces/quay`)

## Development harness

Start this module in isolation:

```bash
yarn workspace @backstage-community/plugin-scaffolder-backend-module-quay start
```

This runs a minimal backend with `@backstage/plugin-scaffolder-backend` and the Quay scaffolder module (`dev/index.ts`). Use it for action registration and local scaffolder smoke.

Only one plugin `dev/` harness should run on port **7007** at a time.

### Environment setup

The `quay:create-repository` action takes Quay credentials and URLs as **template inputs** (see the [example template](./examples/templates/01-quay-template.yaml)). Use local-only placeholder values for development — do not commit secrets.

To exercise that sample template from a consumer Backstage app (or a fuller local app that loads catalog templates), add it as a catalog location in an untracked `app-config.local.yaml` (or your app's `app-config.yaml`):

```yaml
catalog:
  locations:
    - type: file
      target: ../../plugins/quay-actions/examples/templates/01-quay-template.yaml
      rules:
        - allow: [Template]
```

Adjust `target` to the path from that app's config file. You need a Quay account and an OAuth token to run the create-repository step for real.

## Validation commands

From the workspace root (`workspaces/quay`):

```bash
yarn workspace @backstage-community/plugin-scaffolder-backend-module-quay test
yarn workspace @backstage-community/plugin-scaffolder-backend-module-quay lint:check
yarn tsc
```

## What automated tests cover

CI exercises:

- **Module wiring** — `startTestBackend` asserts `scaffolder.addActions` registers `quay:create-repository`
- **Action handler** — create-repository request/response and error paths (unit tests)

CI does **not** replace reading [Backstage release notes](https://github.com/backstage/backstage/releases) for the `@backstage/*` packages this module depends on. After a dependency bump, review those notes and decide whether additional validation is warranted.

## Optional manual smoke checklist

Use when you change scaffolder integration code or are reviewing a Backstage version bump:

1. Start this harness and confirm the backend starts without errors. In the logs, look for scaffolder listing enabled actions and verify `quay:create-repository` is present (alongside built-in actions such as `fetch:template` and `debug:log`).
2. To run the [sample template](./examples/templates/01-quay-template.yaml) end-to-end (create a real Quay repository), use a consumer Backstage app with the catalog location from [Environment setup](#environment-setup) and a Quay OAuth token — not covered by this harness alone.

## Related packages

- [Quay backend](../quay-backend/CONTRIBUTING.md) — registry API plugin
- [Quay frontend](../quay/CONTRIBUTING.md) — entity page UI
- [Quay common](../quay-common/CONTRIBUTING.md) — shared types/permissions
