# Contributing — Quay backend plugin

Developer guide for `@backstage-community/plugin-quay-backend`. For operator install and configuration, see [README.md](./README.md).

## Prerequisites

- Node.js **22 or 24** (see workspace `engines` in the workspace root `package.json`)
- Yarn (workspace uses its own `yarn.lock`; run commands from `workspaces/quay`)

## Development harness

Start this plugin in isolation:

```bash
yarn workspace @backstage-community/plugin-quay-backend start
```

This runs a minimal backend with the Quay backend plugin (`dev/index.ts`). Use it for router, permissions, and Quay API client work.

Only one plugin `dev/` harness should run on port **7007** at a time. For UI smoke against a live entity page, also start the [frontend plugin harness](../quay/CONTRIBUTING.md) (separate process / port) after the backend is up.

### Environment setup

Configure Quay via the workspace [`app-config.yaml`](../../app-config.yaml) or an untracked `app-config.local.yaml`. Use local-only placeholder values for development — do not commit secrets.

| Config key / variable        | Purpose                                                                                    |
| ---------------------------- | ------------------------------------------------------------------------------------------ |
| `quay.apiUrl`                | Quay API base URL (single-instance)                                                        |
| `quay.apiKey`                | OAuth access token / API key (placeholder locally)                                         |
| `quay.instances`             | Multi-instance list (`name`, `apiUrl`, `apiKey`, …) — do not mix with single-instance keys |
| `BACKSTAGE_DEV_STATIC_TOKEN` | Optional static bearer token if you enable `backend.auth.externalAccess` for `curl`        |

Optional overrides can go in an untracked `app-config.local.yaml` at the workspace root.

### API authentication for `curl`

When the default backend auth policy applies, authenticated requests need a Bearer token. You can register a **static** backend access token (see [service-to-service auth](https://backstage.io/docs/auth/service-to-service-auth)):

```yaml
backend:
  auth:
    externalAccess:
      - type: static
        options:
          token: ${BACKSTAGE_DEV_STATIC_TOKEN}
          subject: user:default/guest
```

Example (adjust instance / org / repo):

```bash
curl -H "Authorization: Bearer ${BACKSTAGE_DEV_STATIC_TOKEN}" \
  "http://localhost:7007/api/quay/default/repository/my-org/my-repo/tag"
```

Requests without a valid `Authorization: Bearer …` header are rejected when the default auth policy applies. Viewing Quay data also requires the `quay.view.read` permission (`quayViewPermission`).

## Validation commands

From the workspace root (`workspaces/quay`):

```bash
yarn workspace @backstage-community/plugin-quay-backend test
yarn workspace @backstage-community/plugin-quay-backend lint
yarn tsc
```

## What automated tests cover

CI exercises:

- **Plugin wiring** — `startTestBackend` mount (`httpRouter.use`)
- **Permission middleware** — DENY returns 403
- **Router validation** — 400 when `instanceName` / `org` / `repo` are missing or whitespace
- **QuayService** — config parsing and HTTP client behavior (unit tests)

CI does **not** replace reading [Backstage release notes](https://github.com/backstage/backstage/releases) for the `@backstage/*` packages this plugin depends on. After a dependency bump, review those notes and decide whether additional validation is warranted.

## Optional manual smoke checklist

Use when you change backend integration code or are reviewing a Backstage version bump:

1. Configure Quay placeholders and start this harness.
2. Call a tag list endpoint with Bearer token (see above). Expect `200` with tag JSON when config and permissions allow, or a clear `403` / `404` for deny / unknown instance.
3. Full entity-page UI smoke needs the [frontend harness](../quay/CONTRIBUTING.md) as well.

## Related packages

- [Quay frontend](../quay/CONTRIBUTING.md) — entity page UI
- [Quay common](../quay-common/CONTRIBUTING.md) — shared permission contracts
- [Quay scaffolder actions](../quay-actions/CONTRIBUTING.md) — `quay:create-repository`
