# Contributing — Argo CD backend plugin

Developer guide for `@backstage-community/plugin-argocd-backend`. For operator install and configuration, see [README.md](./README.md).

## Prerequisites

- Node.js **22 or 24** (see workspace `engines` in the workspace root `package.json`)
- Yarn (workspace uses the community-plugins monorepo lockfile)

## Development harness

Start this plugin in isolation with the package’s minimal harness config:

```bash
yarn workspace @backstage-community/plugin-argocd-backend start \
  --config app-config.yaml
```

(`--config` paths are resolved from the plugins directory.)

This runs a minimal backend via `dev/index.ts` with the Argo CD backend plugin. Use it for HTTP router, permissions, and Actions API work.

The harness listens on port **7007**. Only one plugin `dev/` harness should run on that port at a time. To work on the frontend plugin instead, stop this process and start the [frontend harness](../argocd/CONTRIBUTING.md).

### Confirm the plugin loaded

On a successful start you should see (in order):

```log
backstage info Plugin initialization complete, newly initialized: 'backstage-community-argocd' type="initialization"
```

If init fails, you will typically see an error stack instead of `Plugin initialization complete` for that plugin id, and `/api/backstage-community-argocd/check` will not return `200`.

### Environment setup

Export these variables in your shell before starting the harness. Use local-only placeholder values for development — do not commit secrets. The static Backstage token must be at least **8 characters**.

| Variable                     | Purpose                                                               |
| ---------------------------- | --------------------------------------------------------------------- |
| `BACKSTAGE_DEV_STATIC_TOKEN` | Static bearer token for authenticated `curl` calls to the dev backend |
| `ARGOCD_URL`                 | Argo CD API base URL (e.g. `https://argocd.example.com`)              |
| `ARGOCD_AUTH_TOKEN`          | Instance-specific access token (preferred)                            |
| `ARGOCD_USERNAME`            | Default Argo CD username (fallback auth)                              |
| `ARGOCD_PASSWORD`            | Default Argo CD password (fallback auth)                              |

[`app-config.yaml`](./app-config.yaml) in this package is the **minimal** config required to run the dev harness (listen port, static auth, Actions `pluginSources`, and Argo CD instance keys). Prefer starting with `--config app-config.yaml` as shown above.

By default (without `--config`), `yarn start` loads the fuller [`../../app-config.yaml`](../../app-config.yaml) from the workspace root instead. That file is for the optional full workspace app and is not required for this harness. Optional overrides can go in an untracked `app-config.local.yaml` next to whichever config file you pass (or at the workspace root when relying on the default).

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

Authenticated API requests must send that token:

```bash
curl -H "Authorization: Bearer ${BACKSTAGE_DEV_STATIC_TOKEN}" \
  "http://localhost:7007/api/backstage-community-argocd/check"
```

Requests without a valid `Authorization: Bearer …` header are rejected when the default auth policy applies.

## Validation commands

From the workspace root (`workspaces/argocd`):

```bash
yarn workspace @backstage-community/plugin-argocd-backend test
yarn workspace @backstage-community/plugin-argocd-backend lint
yarn tsc
```

Related packages often touched on the same bump:

```bash
yarn workspace @backstage-community/plugin-argocd-common test
yarn workspace @backstage-community/plugin-argocd-node test
```

## What automated tests cover

CI exercises:

- **Plugin wiring** — `startTestBackend` proves router mount, permission registry, and Actions API registration
- **Router permission middleware** — 403 when `argocd.view.read` is denied; handlers are not invoked on deny
- **Actions handlers** — unit tests for find/get/list/revision actions (including permission deny)
- **Node client** — Argo CD HTTP client error paths (`plugin-argocd-node`)

CI does **not** replace reading [Backstage release notes](https://github.com/backstage/backstage/releases) for the `@backstage/*` packages this plugin depends on. After a dependency bump, review those notes and decide whether additional validation is warranted.

## Optional manual smoke checklist

Use when you change backend integration code or are reviewing a Backstage version bump:

1. Export the [environment variables](#environment-setup) and start this harness with `--config app-config.yaml`.
2. Confirm [plugin load logs](#confirm-the-plugin-loaded) (`Listening on :7007` + `Plugin initialization complete ... 'backstage-community-argocd'`).
3. Health check (requires Bearer token) — proves router mount + Backstage permission middleware path:

   ```bash
   curl -i -H "Authorization: Bearer ${BACKSTAGE_DEV_STATIC_TOKEN}" \
     "http://localhost:7007/api/backstage-community-argocd/check"
   ```

   Expect `HTTP/1.1 200` and body `OK`. The harness access log should show something like:

   ```log
   rootHttpRouter info ... "GET /api/backstage-community-argocd/check HTTP/1.1" 200 ...
   ```

## Full workspace app evaluation

The workspace already ships `packages/app` and `packages/backend`. They are **optional** for cross-plugin UI/RBAC smoke (catalog entity cards, frontend + backend together).

Default for bump-trust and day-to-day work: plugin `dev/` + scoped automated tests. Do **not** add another full Backstage application to this workspace.

```bash
# Optional — full workspace only when needed
yarn start:backstage
```

## Related packages

- [Argo CD frontend plugin](../argocd/CONTRIBUTING.md) — UI extensions and API clients (separate `dev/` harness)
