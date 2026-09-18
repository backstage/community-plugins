# Contributing — ServiceNow scaffolder backend module

Developer guide for `@backstage-community/plugin-scaffolder-backend-module-servicenow`. For operator install and configuration, see [README.md](./README.md).

## Prerequisites

- Node.js **22 or 24** (see workspace `engines` in the workspace root `package.json`)
- Yarn (this workspace has its own `yarn.lock`; run commands from `workspaces/scaffolder-backend-module-servicenow/`)

## Development harness

Start this module in isolation with the package’s minimal harness config:

```bash
yarn workspace @backstage-community/plugin-scaffolder-backend-module-servicenow start \
  --config app-config.yaml
```

(`--config` paths are resolved from the plugins directory.)

This runs a minimal backend with `@backstage/plugin-scaffolder-backend` and the ServiceNow module. Use it to verify action registration and local scaffolder integration work.

The harness listens on port **7007**. Only one plugin `dev/` harness should run on that port at a time.

### Environment setup

Export these variables in your shell before starting the harness. Use local-only placeholder values for development — do not commit secrets.

| Variable                     | Purpose                                                               |
| ---------------------------- | --------------------------------------------------------------------- |
| `BACKSTAGE_DEV_STATIC_TOKEN` | Static bearer token for authenticated `curl` calls to the dev backend |
| `SERVICENOW_BASE_URL`        | ServiceNow instance base URL (e.g. `https://example.service-now.com`) |
| `SERVICENOW_USERNAME`        | ServiceNow basic-auth username                                        |
| `SERVICENOW_PASSWORD`        | ServiceNow basic-auth password                                        |

[`app-config.yaml`](./app-config.yaml) in this package is the **minimal** config required to run the dev harness (listen port, static auth, and ServiceNow keys). Prefer starting with `--config app-config.yaml` as shown above.

Optional overrides can go in an untracked `app-config.local.yaml` next to the config file you pass.

### API authentication for `curl`

The harness [`app-config.yaml`](./app-config.yaml) registers a **static** backend access token (see [service-to-service auth](https://backstage.io/docs/auth/service-to-service-auth)):

```yaml
backend:
  auth:
    externalAccess:
      - type: static
        options:
          token: ${BACKSTAGE_DEV_STATIC_TOKEN}
          subject: user:default/guest
```

Authenticated scaffolder API requests must send that token:

```bash
curl -H "Authorization: Bearer ${BACKSTAGE_DEV_STATIC_TOKEN}" \
  "http://localhost:7007/api/scaffolder/v2/actions"
```

Requests without a valid `Authorization: Bearer …` header are rejected when the default auth policy applies.

## Validation commands

From the workspace root (`workspaces/scaffolder-backend-module-servicenow`):

```bash
yarn workspace @backstage-community/plugin-scaffolder-backend-module-servicenow test
yarn workspace @backstage-community/plugin-scaffolder-backend-module-servicenow lint:check
yarn tsc:full
```

## What automated tests cover

CI exercises:

- **Module wiring** — scaffolder extension-point registration of all six ServiceNow Table API actions
- **Config fail-fast** — missing or incomplete `servicenow` config throws from `updateOpenAPIConfig`
- **Action handlers** — MSW-backed happy path, 401/404, and representative errors when the API body lacks `error.message`

CI does **not** replace reading [Backstage release notes](https://github.com/backstage/backstage/releases) for the `@backstage/*` packages this module depends on. After a dependency bump, review those notes and decide whether additional validation is warranted.

## Full workspace app evaluation

This workspace intentionally does **not** include `packages/app` or `packages/backend`. Module and handler tests are the primary merge signal for Backstage version bumps. End-to-end software-template runs belong in a consumer Backstage / RHDH app or in [rhdh-plugin-export-overlays](https://github.com/redhat-developer/rhdh-plugin-export-overlays).

## Optional manual smoke checklist

Use when you change scaffolder integration code or are reviewing a Backstage version bump:

1. Export the [environment variables](#environment-setup) and start this harness.
2. List registered scaffolder actions (requires Bearer token):

   ```bash
   curl -H "Authorization: Bearer ${BACKSTAGE_DEV_STATIC_TOKEN}" \
     "http://localhost:7007/api/scaffolder/v2/actions"
   ```

   Expect these action IDs in the response:

   - `servicenow:now:table:createRecord`
   - `servicenow:now:table:deleteRecord`
   - `servicenow:now:table:modifyRecord`
   - `servicenow:now:table:retrieveRecord`
   - `servicenow:now:table:retrieveRecords`
   - `servicenow:now:table:updateRecord`

3. End-to-end template execution (running a software template through the UI or a full consumer Backstage app) is not covered by this harness alone. Confirm template output under `result` in a consumer app when needed. Live ServiceNow tenant / Playwright coverage belongs in overlays or a consumer deployment — not in this workspace.

## Related packages

- [@backstage/plugin-scaffolder-backend](https://www.npmjs.com/package/@backstage/plugin-scaffolder-backend) — host scaffolder backend plugin for this module
