# Contributing to `@backstage-community/plugin-3scale-backend`

This guide is for **contributors and maintainers** working on the 3scale catalog entity provider. For operator install and production configuration, see [README.md](./README.md).

## Prerequisites

- Node.js **22 or 24** (see `engines` in the workspace `package.json`)
- Yarn (monorepo package manager)
- Clone [backstage/community-plugins](https://github.com/backstage/community-plugins) and work from `workspaces/3scale`

## Default development path

Day-to-day changes do **not** require the full workspace Backstage app (`packages/app`, `packages/backend`). Use the plugin `dev/` harness:

```console
cd workspaces/3scale
yarn install
yarn workspace @backstage-community/plugin-3scale-backend start
```

The harness starts a minimal backend with `@backstage/plugin-catalog-backend` and this module (`dev/index.ts`).

### Configuration

Copy [app-config.example.yaml](./app-config.example.yaml) to `app-config.local.yaml` in this package before starting the plugin harness. That file is gitignored (`*.local.yaml`) so local tokens and overrides are not committed.

For `yarn workspace @backstage-community/plugin-3scale-backend start`, config in this package is enough. If you use the full workspace app (`yarn start` from `workspaces/3scale`), put overlapping overrides in the workspace root `app-config.local.yaml` instead.

Set environment variables before starting:

| Variable                     | Purpose                                                                                                     |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `THREESCALE_BASE_URL`        | 3scale Admin API base URL (e.g. `https://<tenant>-admin.3scale.net`)                                        |
| `THREESCALE_ACCESS_TOKEN`    | Admin API access token                                                                                      |
| `BACKSTAGE_DEV_STATIC_TOKEN` | Dev-only Backstage backend token for catalog API checks via curl (e.g. `local-dev-only-not-for-production`) |

Do not commit real credentials. Use placeholders in tests and local-only env injection. The static Backstage token is for **local development only**—do not reuse it in production deployments.

## Validation commands

From `workspaces/3scale`:

```console
yarn workspace @backstage-community/plugin-3scale-backend test
yarn workspace @backstage-community/plugin-3scale-backend lint
yarn tsc
```

All automated tests run under the package `test` script—no extra CI pipeline configuration.

When reviewing dependency updates, read the relevant upstream release notes and changelogs, then run the commands above and any additional manual checks appropriate to what changed.

## Manual smoke checklist

After `yarn workspace @backstage-community/plugin-3scale-backend start` with valid `THREESCALE_*` env vars, expect log lines similar to:

```log
catalog info Discovering ApiEntities from 3scale <baseUrl> type=plugin target=ThreeScaleApiEntityProvider:dev
catalog info Discovered ApiEntity <service-name> type=plugin target=ThreeScaleApiEntityProvider:dev
catalog info Applying the mutation with <N> entities type=plugin target=ThreeScaleApiEntityProvider:dev
```

You can also inspect ingested APIs via the catalog backend API (backend-only, no UI required). The backend requires an `Authorization` header matching `BACKSTAGE_DEV_STATIC_TOKEN` from your local config (`app-config.local.yaml`, based on [app-config.example.yaml](./app-config.example.yaml)):

```console
curl -s 'http://localhost:7007/api/catalog/entities?filter=kind=API' \
  -H "Authorization: Bearer ${BACKSTAGE_DEV_STATIC_TOKEN}" | jq .
```

Log lines alone are sufficient if you prefer not to configure the static Backstage token.

## When to use the full workspace app

The workspace includes `packages/app` and `packages/backend` as an **optional** integration harness. Examples of when it may be useful:

- Catalog **UI** validation (API definition cards, Swagger rendering)
- Workspace Playwright smoke (`packages/app/e2e-tests`)—currently a generic welcome-page check, not 3scale-specific
- Manual validation that mirrors a full Backstage deployment

Do not add a second full Backstage application to this workspace. The plugin `dev/` harness is the documented default for backend work here.

## Workspace app removal note

The plugin `dev/` harness supports backend development and manual smoke described above. `packages/app` and `packages/backend` may be retired in a future cleanup without blocking contributor workflows, provided this guide remains the documented default path.
