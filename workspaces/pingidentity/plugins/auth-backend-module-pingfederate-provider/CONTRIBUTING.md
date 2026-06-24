# Contributing — PingFederate auth backend module

Developer guide for `@backstage-community/plugin-auth-backend-module-pingfederate-provider`. For operator install and configuration, see [README.md](./README.md).

## Prerequisites

- Node.js **22 or 24** (see workspace `engines` in the workspace root `package.json`)
- Yarn (workspace uses the community-plugins monorepo lockfile)

## Development harness

Start this module in isolation:

```bash
yarn workspace @backstage-community/plugin-auth-backend-module-pingfederate-provider start
```

This runs a minimal backend with `@backstage/plugin-auth-backend` and the PingFederate provider module. Use it for OAuth flow, authenticator, and resolver work.

Only one plugin `dev/` harness should run on port **7007** at a time. To work on the PingOne catalog module instead, stop this process and start the [catalog module harness](../catalog-backend-module-pingidentity/CONTRIBUTING.md).

### Environment setup

Export these variables in your shell before starting the harness. Use local-only placeholder values for development — do not commit secrets.

| Variable                     | Purpose                                                                |
| ---------------------------- | ---------------------------------------------------------------------- |
| `PINGFEDERATE_BASE_URL`      | PingFederate OIDC issuer base URL                                      |
| `PINGFEDERATE_CLIENT_ID`     | OAuth client ID                                                        |
| `PINGFEDERATE_CLIENT_SECRET` | OAuth client secret                                                    |
| `AUTH_SESSION_SECRET`        | Backstage auth session signing secret (any long random string locally) |
| `BACKSTAGE_DEV_STATIC_TOKEN` | Static bearer token for authenticated `curl` calls to the dev backend  |

Config keys are defined in [`app-config.yaml`](./app-config.yaml). You may override them in an untracked `app-config.local.yaml` beside the package if your local Backstage CLI setup supports it.

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

Use the same value you exported for `BACKSTAGE_DEV_STATIC_TOKEN` as a Bearer token when a route requires authentication:

```bash
curl -H "Authorization: Bearer ${BACKSTAGE_DEV_STATIC_TOKEN}" \
  "http://localhost:7007/api/catalog/entities?limit=1"
```

The auth-only harness does not run the catalog plugin, so that example may return an empty list or a routing error — it is included to show the header shape. Prefer the smoke commands below for this package.

**OAuth sign-in smoke** does not use the static Bearer token; it relies on redirects and session cookies instead.

## Validation commands

From the workspace root (`workspaces/pingidentity`):

```bash
yarn workspace @backstage-community/plugin-auth-backend-module-pingfederate-provider test
yarn workspace @backstage-community/plugin-auth-backend-module-pingfederate-provider lint
yarn tsc
```

## What automated tests cover

CI exercises:

- **Sign-in resolvers** — dual-claim security (`sub`, LDAP UUID) between userinfo and ID token
- **Authenticator** — OIDC token exchange, refresh, and revocation paths (MSW)
- **Module wiring** — provider registration and OAuth redirect/cookie flow via `startTestBackend`

CI does **not** replace reading [Backstage release notes](https://github.com/backstage/backstage/releases) for the `@backstage/*` packages this module depends on. After a dependency bump, review those notes and decide whether additional validation is warranted.

## Optional manual smoke checklist

Use when you change auth integration code or are reviewing a Backstage version bump:

1. Export the [environment variables](#environment-setup) and start this harness.
2. OAuth start (no `Authorization` header):

   ```bash
   curl -i "http://localhost:7007/api/auth/pingfederate/start?env=development"
   ```

   Expect `302` with a `Location` header pointing at your PingFederate authorize URL.

3. Full interactive sign-in and resolver pairing with catalog users requires a Backstage deployment that also runs the catalog module — not covered by this harness alone.

## Related packages

- [Ping Identity catalog module](../catalog-backend-module-pingidentity/CONTRIBUTING.md) — PingOne entity ingestion (separate `dev/` harness)
