# Contributing — Kubernetes scaffolder backend module

Developer guide for `@backstage-community/plugin-scaffolder-backend-module-kubernetes`. For operator install and configuration, see [README.md](./README.md).

## Prerequisites

- Node.js **22 or 24** (see workspace `engines` in the workspace root `package.json`)
- Yarn (this workspace has its own `yarn.lock`; run commands from `workspaces/scaffolder-backend-module-kubernetes/`)

## Development harness

Start this module in isolation with the package’s minimal harness config:

```bash
yarn workspace @backstage-community/plugin-scaffolder-backend-module-kubernetes start \
  --config app-config.yaml
```

(`--config` paths are resolved from the plugins directory.)

This runs a minimal backend with `@backstage/plugin-scaffolder-backend` and the kubernetes module. Use it to verify action registration and local scaffolder integration work.

The harness listens on port **7007**. Only one plugin `dev/` harness should run on that port at a time.

### Environment setup

Export this variable in your shell before starting the harness. Use a local-only placeholder value for development — do not commit secrets. The token must be at least **8 characters**.

| Variable                     | Purpose                                                               |
| ---------------------------- | --------------------------------------------------------------------- |
| `BACKSTAGE_DEV_STATIC_TOKEN` | Static bearer token for authenticated `curl` calls to the dev backend |

[`app-config.yaml`](./app-config.yaml) in this package is the **minimal** config required to run the dev harness (listen port and static auth). Prefer starting with `--config app-config.yaml` as shown above.

By default (without `--config`), `yarn start` may load a fuller workspace-root config if present. That path is not required for this harness. Optional overrides can go in an untracked `app-config.local.yaml` next to whichever config file you pass (or at the workspace root when relying on the default).

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

From the workspace root (`workspaces/scaffolder-backend-module-kubernetes`):

```bash
yarn workspace @backstage-community/plugin-scaffolder-backend-module-kubernetes test
yarn workspace @backstage-community/plugin-scaffolder-backend-module-kubernetes lint:check
yarn tsc
```

## What automated tests cover

CI exercises:

- **Module wiring** (`module.test.ts`) — scaffolder extension-point registration of `kubernetes:create-namespace`. This is the primary bump-trust signal for DI/extension-point breaks.
- **Schema validation** — Zod → JSON Schema contract from `createTemplateAction` (required `namespace` / `token`); missing required fields are asserted against `action.schema.input` without calling the handler / MSW.
- **Action handler** — catalog `clusterRef` resolution, `url: ''` contract, generic HTTP client errors, string-`body` Kubernetes Status JSON parsing, and one happy-path outbound `POST /api/v1/namespaces` body assert.

Handler-only tests do **not** replace `module.test.ts` for bump trust.

CI does **not** replace reading [Backstage release notes](https://github.com/backstage/backstage/releases) for the `@backstage/*` packages this module depends on. After a dependency bump, review those notes and decide whether additional validation is warranted.

## Workspace evaluation (full app)

This workspace is **plugin-only** (`plugins/kubernetes-actions`). Do **not** add `packages/app` or `packages/backend` here. Day-to-day contributor and CI work uses:

1. Package unit / module tests (merge gate)
2. Optional `dev/` harness above

Full software-template E2E belongs in a **consumer** Backstage / RHDH app, or in [rhdh-plugin-export-overlays](https://github.com/redhat-developer/rhdh-plugin-export-overlays) when credential-backed cluster coverage is needed.

## Optional manual smoke checklist

Use when you change scaffolder integration code or are reviewing a Backstage version bump:

1. Export the [environment variables](#environment-setup) and start this harness.
2. List registered scaffolder actions (requires Bearer token):

   ```bash
   curl -H "Authorization: Bearer ${BACKSTAGE_DEV_STATIC_TOKEN}" \
     "http://localhost:7007/api/scaffolder/v2/actions"
   ```

   Expect the `kubernetes:create-namespace` action ID in the response.

3. In a **consumer** Backstage app (not this workspace): register the module, load `examples/templates/01-kubernetes-template.yaml` (or equivalent), and run a template with `clusterRef` or `url` plus a placeholder Kubernetes API `token`. Live cluster / overlay Playwright is only needed when validating real cluster behavior.

## Related packages

- [@backstage/plugin-scaffolder-backend](https://www.npmjs.com/package/@backstage/plugin-scaffolder-backend) — host scaffolder backend plugin for this module
