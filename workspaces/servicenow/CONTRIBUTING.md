# Contributing — ServiceNow workspace

Plugin-only workspace for `@backstage-community/plugin-servicenow*`. There is **no** in-repo `packages/app` / `packages/backend`; use the plugin `dev/` harnesses and scoped package tests.

## Start both harnesses

From this directory, `backstage-cli repo start` launches the frontend and backend plugin harnesses together:

```bash
# From workspaces/servicenow
yarn start
```

That is the preferred local smoke path — you do **not** need a full Backstage application in this workspace.

The frontend harness (http://localhost:3000) has two sidebar pages:

| Sidebar item             | Path               | Data source                                   |
| ------------------------ | ------------------ | --------------------------------------------- |
| **ServiceNow (Mock)**    | `/servicenow`      | In-memory fixtures (no backend)               |
| **ServiceNow (Backend)** | `/servicenow-live` | This workspace's backend harness on port 7007 |

Use **Mock** for UI work without ServiceNow. Use **Backend** when both harnesses are running and you want the frontend client to call the backend plugin (and a real ServiceNow instance, if configured). For instance credentials, see [plugins/servicenow-backend/CONTRIBUTING.md](./plugins/servicenow-backend/CONTRIBUTING.md).

You can still start a single package when needed:

```bash
yarn workspace @backstage-community/plugin-servicenow start
yarn workspace @backstage-community/plugin-servicenow-backend start
```

Do **not** pass `--config app-config.yaml` on the backend package start. Relative `--config` paths are resolved from the **package** directory (`plugins/servicenow-backend/`), not this workspace root, so that flag looks for a file that is not in the package. Omit `--config` (or pass `--config ../../app-config.yaml`) so the backend loads [`app-config.yaml`](./app-config.yaml) here. Details are in the [backend contributing guide](./plugins/servicenow-backend/CONTRIBUTING.md).

## Package test commands

| Package  | Command                                                              |
| -------- | -------------------------------------------------------------------- |
| Backend  | `yarn workspace @backstage-community/plugin-servicenow-backend test` |
| Frontend | `yarn workspace @backstage-community/plugin-servicenow test`         |
| Common   | `yarn workspace @backstage-community/plugin-servicenow-common test`  |

Typecheck from this directory: `yarn tsc`.

## Contributor guides

- [Backend CONTRIBUTING.md](./plugins/servicenow-backend/CONTRIBUTING.md)
- [Frontend CONTRIBUTING.md](./plugins/servicenow/CONTRIBUTING.md)
- [Local development](./docs/Development.md)
