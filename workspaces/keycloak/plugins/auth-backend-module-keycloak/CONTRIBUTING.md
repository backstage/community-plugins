# Contributing — Keycloak auth backend module

Developer guide for `@backstage-community/plugin-auth-backend-module-keycloak-provider`. For operator install and configuration, see [README.md](./README.md).

## Prerequisites

- Node.js **22 or 24** (see workspace `engines` in the workspace root `package.json`)
- Yarn (workspace uses the community-plugins monorepo lockfile)
- **Docker** — local Keycloak for integration smoke (port **8080**)

## Development harness

Start Keycloak with realm import (terminal 1):

```bash
yarn workspace @backstage-community/plugin-catalog-backend-module-keycloak start:keycloak
```

This imports [`backstage-community-realm`](../catalog-backend-module-keycloak/__fixtures__/keycloak-realm.json). The realm contains the `backstage` OAuth client and user `test` (`test@example.com`, password `test`).

### Environment setup

The dev [`app-config.yaml`](./app-config.yaml) uses `${ENV_VAR}` placeholders for credentials. You can provide them via environment variables or an untracked `app-config.local.yaml` file.

All values can be found in [`__fixtures__/keycloak-realm.json`](../catalog-backend-module-keycloak/__fixtures__/keycloak-realm.json) — look for the `backstage` client entry. `BACKSTAGE_DEV_STATIC_TOKEN` can be any arbitrary string — it just needs to match between `app-config.yaml` and your `curl` commands.

**Option A — `app-config.local.yaml`** (recommended, one-time setup):

Create `plugins/auth-backend-module-keycloak/app-config.local.yaml` (gitignored via `*.local.yaml`) and fill in values matching the env var table below.

**Option B — environment variables:**

Export the variables listed below before starting the harness.

| Variable                      | Purpose                                                 |
| ----------------------------- | ------------------------------------------------------- |
| `AUTH_KEYCLOAK_CLIENT_ID`     | OAuth client ID from the realm fixture                  |
| `AUTH_KEYCLOAK_CLIENT_SECRET` | OAuth client secret from the realm fixture              |
| `AUTH_KEYCLOAK_BASE_URL`      | Keycloak server URL (e.g. `http://localhost:8080`)      |
| `AUTH_KEYCLOAK_REALM`         | Realm for sign-in from the realm fixture                |
| `AUTH_SESSION_SECRET`         | Auth session signing secret (any string locally)        |
| `BACKSTAGE_DEV_STATIC_TOKEN`  | Static bearer token for service-to-service `curl` calls |

### Starting the harness

Start the auth module harness (terminal 2, after Keycloak is healthy):

```bash
# With default app-config.yaml
yarn workspace @backstage-community/plugin-auth-backend-module-keycloak-provider start
# Or alternative command to use additional app-config.local.yaml
yarn workspace @backstage-community/plugin-auth-backend-module-keycloak-provider start --config app-config.local.yaml
```

This runs a minimal backend with `@backstage/plugin-auth-backend`, `@backstage/plugin-catalog-backend`, and the Keycloak provider module, loading [`app-config.yaml`](./app-config.yaml) via `--config`. The dev config registers a catalog `User` entity named `test` (from [`dev/catalog/users.yaml`](./dev/catalog/users.yaml)) so `preferredUsernameMatchingUserEntityName` can resolve during OAuth sign-in.

On startup the log must include `Loading config from ... app-config.yaml` (package config, not only the workspace root file) and `Listening on :7007`. If port **7007** is already in use (for example by another workspace backend), free it or the harness may bind another port — use that port in smoke commands.

Only one plugin `dev/` harness should run on port **7007** at a time. To work on the catalog module instead, stop this process and start the [catalog module harness](../catalog-backend-module-keycloak/CONTRIBUTING.md).

### OAuth redirect smoke

Prerequisites: Keycloak healthy and this auth harness running.

Quick redirect check (no password required):

```bash
curl -i "http://localhost:7007/api/auth/keycloak/start?env=development"
```

Expect `302` with a `Location` header pointing at the Keycloak authorize URL (`.../realms/<realm>/protocol/openid-connect/auth`). This confirms the module is wired correctly, the Keycloak issuer discovery succeeded, and the OAuth client config is valid.

Confirm the catalog fixture user is loaded (use your `BACKSTAGE_DEV_STATIC_TOKEN`):

```bash
curl -s -H "Authorization: Bearer ${BACKSTAGE_DEV_STATIC_TOKEN}" \
  "http://localhost:7007/api/catalog/entities/by-name/user/default/test"
```

Expect a `User` entity — if you get `404`, wait a few seconds after harness startup (catalog `processingInterval` is 3s in dev config) and retry.

> **Full OAuth flow limitation:** This workspace does not ship `packages/app` (community-plugins policy). The full authorization-code flow (login → token exchange → resolver) requires either a Backstage frontend or a headless login script. Automated tests in `module.test.ts` cover the redirect, discovery URL, and module wiring; the sign-in resolver logic is tested separately in `resolvers.test.ts`.

### API authentication for `curl` (static token)

The dev [`app-config.yaml`](./app-config.yaml) registers a **static** backend access token for service-to-service calls (see [service-to-service auth](https://backstage.io/docs/auth/service-to-service-auth)).

Use this for quick API checks without going through OAuth:

```bash
curl -s -H "Authorization: Bearer ${BACKSTAGE_DEV_STATIC_TOKEN}" \
  http://localhost:7007/.backstage/health/v1/readiness
```

The static token is for service-to-service API checks; it does not exercise the OAuth sign-in flow.

## Validation commands

From the workspace root (`workspaces/keycloak`):

```bash
yarn workspace @backstage-community/plugin-auth-backend-module-keycloak-provider test
yarn workspace @backstage-community/plugin-auth-backend-module-keycloak-provider lint
yarn tsc
```

## What automated tests cover

CI exercises:

- **Sign-in resolvers** — `preferredUsernameMatchingUserEntityName`, `oidcSubClaimMatchingKeycloakUserId`, `ldapUuidMatchingAnnotation`, and delegation to common resolvers
- **Auth↔catalog contract** — identical sanitized entity names for representative usernames with the catalog module default transformer (see [Sign-in alignment](#sign-in-alignment-with-the-catalog-module))
- **Authenticator** — issuer discovery, authorization URL, token exchange, refresh, and revocation paths (MSW)
- **Module wiring** — provider registration at the auth extension point, including composition with `@backstage/plugin-auth-backend`

CI does **not** replace reading [Backstage release notes](https://github.com/backstage/backstage/releases) for the `@backstage/*` packages this module depends on. After a dependency bump, review those notes and decide whether additional validation is warranted.

## Sign-in alignment with the catalog module

The `preferredUsernameMatchingUserEntityName` resolver sanitizes Keycloak `preferred_username` to match catalog `User.metadata.name` from [`@backstage-community/plugin-catalog-backend-module-keycloak`](../catalog-backend-module-keycloak/CONTRIBUTING.md). Both packages duplicate the same regex until a shared `keycloak-common` package exists — contract tests must stay in sync when either side changes.

## When downstream app validation is needed

The `dev/` harness and automated tests cover module wiring, OAuth redirect, and resolver logic. That is sufficient for routine plugin PRs and Backstage dependency bumps.

Validate in a **downstream Backstage application** (your own deployment with `packages/app`) when you change:

- Frontend sign-in UI, redirect URLs bound to a real app origin, or cookie/session behavior in the browser
- Auth or catalog configuration that this workspace harness does not model

Document that validation in the PR; do not add `packages/app` to this workspace.

## Full workspace app policy

This workspace does **not** ship `packages/app` or `packages/backend` (community-plugins repo policy). Use this auth harness plus the [catalog module harness](../catalog-backend-module-keycloak/CONTRIBUTING.md) for module-level work.

## Optional manual smoke checklist

Use when you change auth integration code or are reviewing a Backstage version bump:

1. Start Keycloak (`start:keycloak`).
2. Start this auth harness (`start`).
3. Verify `302` redirect: `curl -i "http://localhost:7007/api/auth/keycloak/start?env=development"`.
4. Confirm catalog user `test` is present via static-token `curl` (see [OAuth redirect smoke](#oauth-redirect-smoke)).

### Troubleshooting

| Symptom                                         | Likely cause                                    | Fix                                                                                                                                                                                |
| ----------------------------------------------- | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ECONNREFUSED` on port 8080                     | Keycloak not running                            | Run `yarn workspace @backstage-community/plugin-catalog-backend-module-keycloak start:keycloak`                                                                                    |
| `Invalid parameter: redirect_uri` from Keycloak | Stale Keycloak container with old client config | Stop/remove the container and run `start:keycloak` again to re-import the realm fixture                                                                                            |
| `401` / `Illegal token`                         | Wrong backend on the port                       | Stop other backends on **7007**                                                                                                                                                    |
| Resolver mismatch                               | Username sanitization vs catalog entity name    | Ensure catalog `User` metadata.name matches sanitized Keycloak `preferred_username`; see [Sign-in alignment](#sign-in-alignment-with-the-catalog-module)                           |
| Realm changes ignored                           | Stale Docker container                          | Stop/remove the container and run `yarn workspace @backstage-community/plugin-catalog-backend-module-keycloak start:keycloak` again — import runs only on first container creation |

## Related packages

- [Keycloak catalog module](../catalog-backend-module-keycloak/CONTRIBUTING.md) — ingests realm users and groups as catalog entities (separate `dev/` harness; use in production alongside this auth module)
