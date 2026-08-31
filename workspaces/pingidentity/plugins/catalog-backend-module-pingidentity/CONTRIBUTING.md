# Contributing — Ping Identity catalog backend module

Developer guide for `@backstage-community/plugin-catalog-backend-module-pingidentity`. For operator install and configuration, see [README.md](./README.md).

## Prerequisites

- Node.js **22 or 24** (see workspace `engines` in the workspace root `package.json`)
- Yarn (workspace uses the community-plugins monorepo lockfile)

## Development harness

Start this module in isolation with the package's minimal harness config:

```bash
yarn workspace @backstage-community/plugin-catalog-backend-module-pingidentity start \
  --config app-config.yaml
```

(`--config` paths are resolved from the plugin package directory.)

This runs a minimal backend with `@backstage/plugin-catalog-backend` and the Ping Identity entity provider module. Use it for ingestion, transformers, and PingOne API client work.

Only one plugin `dev/` harness should run on port **7007** at a time. To work on the PingFederate auth module instead, stop this process and start the [auth module harness](../auth-backend-module-pingfederate-provider/CONTRIBUTING.md).

### Environment setup

Export these variables in your shell before starting the harness. Use local-only placeholder values for development — do not commit secrets.

| Variable                      | Purpose                                                               |
| ----------------------------- | --------------------------------------------------------------------- |
| `PING_IDENTITY_API_PATH`      | PingOne API base path (e.g. `https://api.pingone.com/v1`)             |
| `PING_IDENTITY_AUTH_PATH`     | PingOne auth base path (e.g. `https://auth.pingone.com`)              |
| `PING_IDENTITY_ENV_ID`        | PingOne environment ID                                                |
| `PING_IDENTITY_CLIENT_ID`     | OAuth client ID for PingOne Management API                            |
| `PING_IDENTITY_CLIENT_SECRET` | OAuth client secret                                                   |
| `BACKSTAGE_DEV_STATIC_TOKEN`  | Static bearer token for authenticated `curl` calls to the dev backend |

[`app-config.yaml`](./app-config.yaml) in this package is the **minimal** config required to run the dev harness (listen port, static auth, and PingOne provider settings). Prefer starting with `--config app-config.yaml` as shown above.

By default (without `--config`), `yarn start` loads the fuller [`../../app-config.yaml`](../../app-config.yaml) from the workspace root instead. That file is for a broader local Backstage app setup, sets `auth.dangerouslyDisableDefaultAuthPolicy: true`, and does not define the static backend token used by the smoke `curl` examples below. Optional overrides can go in an untracked `app-config.local.yaml` next to whichever config file you pass (or at the workspace root when relying on the default).

### API authentication for `curl`

The dev [`app-config.yaml`](./app-config.yaml) registers a **static** backend access token (see [service-to-service auth](https://backstage.io/docs/auth/service-to-service-auth)):

```yaml
backend:
  auth:
    externalAccess:
      - type: static
        options:
          token: ${BACKSTAGE_DEV_STATIC_TOKEN}
          subject: user:default/guest
```

Authenticated catalog API requests must send that token:

```bash
curl -H "Authorization: Bearer ${BACKSTAGE_DEV_STATIC_TOKEN}" \
  "http://localhost:7007/api/catalog/entities?filter=kind=User"
```

Requests without a valid `Authorization: Bearer …` header are rejected when the default auth policy applies.

## Validation commands

From the workspace root (`workspaces/pingidentity`):

```bash
yarn workspace @backstage-community/plugin-catalog-backend-module-pingidentity test
yarn workspace @backstage-community/plugin-catalog-backend-module-pingidentity lint
yarn tsc
```

## What automated tests cover

CI exercises:

- **Module wiring** — catalog extension-point registration and zero-config behavior
- **Transformer extension point** — double-set guards and custom transformer wiring
- **Config contract** — provider config parsing and validation
- **HTTP client** — PingOne API error paths (MSW)
- **Entity provider** — read/schedule paths and mutations

CI does **not** replace reading [Backstage release notes](https://github.com/backstage/backstage/releases) for the `@backstage/*` packages this module depends on. After a dependency bump, review those notes and decide whether additional validation is warranted.

## Optional manual smoke checklist

Use when you change catalog integration code or are reviewing a Backstage version bump:

1. Export the [environment variables](#environment-setup) and start this harness.
2. List ingested users (requires Bearer token):

   ```bash
   curl -H "Authorization: Bearer ${BACKSTAGE_DEV_STATIC_TOKEN}" \
     "http://localhost:7007/api/catalog/entities?filter=kind=User"
   ```

   Expect users after the provider refresh runs (may take one schedule cycle).

3. Testing auth resolver pairing (`subClaimMatchingPingIdentityUserId`, `ldapUuidMatchingAnnotation`) requires a Backstage instance that also runs the PingFederate auth module — not covered by this harness alone.

## Related packages

- [PingFederate auth module](../auth-backend-module-pingfederate-provider/CONTRIBUTING.md) — OIDC sign-in (separate `dev/` harness)
