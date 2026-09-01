# Contributing — Tekton frontend plugin

Developer guide for `@backstage-community/plugin-tekton`. For operator install and end-user configuration, see [README.md](./README.md).

## Prerequisites

- Node.js **22 or 24** (see workspace `engines` in the workspace root `package.json`)
- Yarn (this workspace has its own `yarn.lock` under `workspaces/tekton`)

## Development harness

Start this plugin in isolation with the new frontend system (default):

```bash
yarn workspace @backstage-community/plugin-tekton start
```

This serves the frontend plugin via `dev/index.tsx` with mocked Kubernetes data. Use it for UI extensions, hooks, and entity-tab work.

Legacy (pre-NFS) entrypoint:

```bash
yarn workspace @backstage-community/plugin-tekton start:legacy
```

Only one frontend `dev/` harness should run at a time on the default plugin port.

The `dev/` harness uses fixtures under `src/__fixtures__/`. Do not commit real cluster credentials.

## Validation commands

From the workspace root (`workspaces/tekton`):

```bash
yarn workspace @backstage-community/plugin-tekton test
yarn workspace @backstage-community/plugin-tekton lint
yarn tsc
```

## What automated tests cover

CI exercises unit tests for plugin APIs, hooks, utils, and UI components, plus Playwright e2e against the legacy `dev/` harness with mocked pipeline data.

CI does **not** replace reading [Backstage release notes](https://github.com/backstage/backstage/releases) for the `@backstage/*` packages this plugin depends on. After a dependency bump, review those notes and decide whether additional validation is warranted.
