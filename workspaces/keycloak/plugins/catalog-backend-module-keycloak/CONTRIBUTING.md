# Contributing — Keycloak catalog backend module

Developer guide for `@backstage-community/plugin-catalog-backend-module-keycloak`. For operator install and configuration, see [README.md](./README.md).

## Prerequisites

- Node.js **22 or 24** (see workspace `engines` in the workspace root `package.json`)
- Yarn (workspace uses the community-plugins monorepo lockfile)
- **Docker** — local Keycloak for integration smoke (port **8080**)

## Development harness

Start Keycloak with realm import (terminal 1):

```bash
yarn workspace @backstage-community/plugin-catalog-backend-module-keycloak start:keycloak
```

This imports [`backstage-community-realm`](./__fixtures__/keycloak-realm.json). The realm contains the `backstage` client, groups, and user profiles (for example `test` / `test`) that the catalog provider ingests as `User` and `Group` entities.

### Environment setup

The dev [`app-config.yaml`](./app-config.yaml) uses `${ENV_VAR}` placeholders for credentials. You can provide them via environment variables or an untracked `app-config.local.yaml` file.

All values can be found in [`__fixtures__/keycloak-realm.json`](./__fixtures__/keycloak-realm.json) — look for the `backstage` client entry. `BACKSTAGE_DEV_STATIC_TOKEN` can be any arbitrary string — it just needs to match between `app-config.yaml` and your `curl` commands.

**Option A — `app-config.local.yaml`** (recommended, one-time setup):

Create `plugins/catalog-backend-module-keycloak/app-config.local.yaml` (gitignored via `*.local.yaml`) and fill in values matching the env var table below.

**Option B — environment variables:**

Export the variables listed below before starting the harness.

| Variable                     | Purpose                                            |
| ---------------------------- | -------------------------------------------------- |
| `KEYCLOAK_BASE_URL`          | Keycloak server URL (e.g. `http://localhost:8080`) |
| `KEYCLOAK_REALM`             | Realm to synchronize from the realm fixture        |
| `KEYCLOAK_CLIENT_ID`         | OAuth client ID from the realm fixture             |
| `KEYCLOAK_CLIENT_SECRET`     | Client secret from the realm fixture               |
| `BACKSTAGE_DEV_STATIC_TOKEN` | Static bearer token for authenticated `curl` calls |

### Starting the harness

Start the catalog module harness (terminal 2, after Keycloak is healthy):

```bash
# With default app-config.yaml
yarn workspace @backstage-community/plugin-catalog-backend-module-keycloak start
# Or alternative command to use additional app-config.local.yaml
yarn workspace @backstage-community/plugin-catalog-backend-module-keycloak start --config app-config.local.yaml
```

This runs a minimal backend with `@backstage/plugin-catalog-backend` and the Keycloak entity provider module, loading [`app-config.yaml`](./app-config.yaml) via `--config`. Use it for ingestion, transformers, and Keycloak Admin API client work.

On startup the log must include `Loading config from ... plugins/catalog-backend-module-keycloak/app-config.yaml` (the package `app-config.yaml` passed via `--config` in `package.json`, **not** the workspace root [`app-config.yaml`](../../app-config.yaml)). Also expect `Listening on :7007`. If port **7007** is already in use (for example by another workspace backend), free it or the harness may bind another port — use that port in smoke `curl` commands.

Only one plugin `dev/` harness should run on port **7007** at a time.

### API authentication for `curl`

The dev [`app-config.yaml`](./app-config.yaml) registers a **static** backend access token (see [service-to-service auth](https://backstage.io/docs/auth/service-to-service-auth)).

Authenticated catalog API requests must send that token:

```bash
curl -H "Authorization: Bearer ${BACKSTAGE_DEV_STATIC_TOKEN}" \
  "http://localhost:7007/api/catalog/entities?filter=kind=User"
```

Requests without a valid `Authorization: Bearer …` header are rejected when the default auth policy applies.

## Validation commands

From the workspace root (`workspaces/keycloak`):

```bash
yarn workspace @backstage-community/plugin-catalog-backend-module-keycloak test
yarn workspace @backstage-community/plugin-catalog-backend-module-keycloak lint:check
yarn tsc
```

## What automated tests cover

CI exercises:

- **Module wiring** — provider registration, schedules, transformer extension point (double-set throws, custom transformers reaching `fromConfig`), and zero-config behavior
- **Config contract** — provider config parsing and validation; missing per-provider `schedule` when using `scheduler`
- **Authentication** — username/password and client-credentials grant paths to the Keycloak Admin API; missing credentials → `InputError`; near-expiry JWT refresh via `ensureTokenValid`
- **Entity provider** — read/schedule paths against mocked Keycloak responses
- **Realm read pipeline** — user/group parsing, pagination, partial batch failure metrics, and transformers across Keycloak API versions
- **Auth↔catalog contract** — paired sanitization assertions for representative usernames (see [Sign-in alignment](#sign-in-alignment-with-the-auth-module))

CI does **not** replace reading [Backstage release notes](https://github.com/backstage/backstage/releases) for the `@backstage/*` packages this module depends on. After a dependency bump, review those notes and decide whether additional validation is warranted.

## Sign-in alignment with the auth module

When Keycloak users sign in via [`@backstage-community/plugin-auth-backend-module-keycloak-provider`](../auth-backend-module-keycloak/CONTRIBUTING.md), the auth `preferredUsernameMatchingUserEntityName` resolver must resolve the same catalog `User.metadata.name` that this module ingests from Keycloak usernames.

Both packages duplicate the same sanitization regex until a shared `keycloak-common` package exists. Automated contract tests in both packages assert identical output for representative inputs (for example `Jane Doe/Admin@Example` → `Jane-Doe-Admin-Example`). **Do not change one side without updating the other and the contract tests.**

For OAuth sign-in smoke beyond catalog ingestion, use the auth module harness — not a full workspace `packages/app`.

## Full workspace app policy

This workspace does **not** ship `packages/app` or `packages/backend`. Plugin `dev/` harnesses (this catalog module and the auth module) are sufficient for provider and resolver work. Full OIDC sign-in in a downstream Backstage application remains out of scope for routine PR validation — document and run that only when changing integration that the harnesses do not cover.

## Optional manual smoke checklist

Use when you change catalog integration code or are reviewing a Backstage version bump:

1. Start Keycloak (`start:keycloak`), set up environment (see [Environment setup](#environment-setup)), then start this harness.
2. List ingested users (requires Bearer token):

   ```bash
   curl -H "Authorization: Bearer ${BACKSTAGE_DEV_STATIC_TOKEN}" \
     "http://localhost:7007/api/catalog/entities?filter=kind=User"
   ```

   Expect users such as `test` after the provider refresh runs. Backend logs should include `Reading Keycloak users and groups`.

### Troubleshooting

| Symptom                                   | Likely cause                                                                           | Fix                                                                                                                                                                                |
| ----------------------------------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ECONNREFUSED` on port 8080               | Keycloak not running                                                                   | Run `yarn workspace @backstage-community/plugin-catalog-backend-module-keycloak start:keycloak`                                                                                    |
| Catalog sync fails at startup             | Keycloak down when harness starts                                                      | Start Keycloak first, then restart `start`                                                                                                                                         |
| `401 Unauthorized` on catalog `curl`      | Harness loaded workspace root config (no `backend.auth.externalAccess`) or wrong token | Confirm startup log loads **plugin** `app-config.yaml`, not only workspace root; stop other backends on **7007**                                                                   |
| `401` / `Illegal token` on catalog `curl` | Wrong backend on the port or token mismatch                                            | Stop other backends on **7007**; confirm logs show this package's `app-config.yaml` and the expected listen port                                                                   |
| Realm changes ignored                     | Stale Docker container                                                                 | Stop/remove the container and run `yarn workspace @backstage-community/plugin-catalog-backend-module-keycloak start:keycloak` again — import runs only on first container creation |

## Related packages

- [Keycloak auth module](../auth-backend-module-keycloak/CONTRIBUTING.md) — OIDC sign-in and resolver smoke (separate `dev/` harness; pair with this module in production)
