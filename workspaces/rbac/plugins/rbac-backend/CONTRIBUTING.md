# Contributing — RBAC backend plugin

Developer guide for `@backstage-community/plugin-rbac-backend`. For operator install and configuration, see [README.md](./README.md).

## Prerequisites

- Node.js **22+** (see workspace `engines` in the workspace root `package.json`)
- Yarn (community-plugins monorepo lockfile)

## Development harness

Start the backend plugin in isolation (auth, catalog, permission, and RBAC — no frontend):

```bash
# From workspaces/rbac
yarn workspace @backstage-community/plugin-rbac-backend start
```

Sample non-secret config keys live in [`app-config.yaml`](./app-config.yaml) beside this package. Optional overrides: untracked `app-config.local.yaml` in the same directory.

For OIDC-backed manual permission checks (Keycloak + superhero CSV policies):

```bash
yarn workspace @backstage-community/plugin-rbac-backend start:manual-tests
```

See [manual-tests/README.md](./manual-tests/README.md) for that flow.

Only one backend `dev/` harness should listen on port **7007** at a time.

### Recommended workflows

| Goal                         | Command                                                                                                                           |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Backend / REST / policy work | `yarn workspace @backstage-community/plugin-rbac-backend start`                                                                   |
| UI work (mocked APIs)        | `yarn workspace @backstage-community/plugin-rbac start:mock`                                                                      |
| Multi-user permission smoke  | `yarn workspace @backstage-community/plugin-rbac-backend start:manual-tests` + [manual-tests/README.md](./manual-tests/README.md) |

### Full workspace evaluation

There is no in-repo full Backstage app (`packages/app`, `packages/backend`). Day-to-day development uses plugin `dev/` harnesses plus automated tests. Legacy NFS-related CI in this workspace was evaluated and remains unchanged — backend `dev/` plus unit/integration tests cover module init and permission route registration.

## Validation commands

From `workspaces/rbac`:

```bash
yarn workspace @backstage-community/plugin-rbac-backend test
yarn workspace @backstage-community/plugin-rbac-backend lint:check
yarn tsc
```

## What automated tests cover

CI exercises:

- **`startTestBackend`** — RBAC module init and `GET /api/permission/roles` route registration (`src/plugin.test.ts`)
- **Policy contracts** — Casbin/precedence and documented `superUsers` direct-membership rule (`src/policies/permission-policy.test.ts`)
- **REST handlers** — role and policy CRUD with mocked dependencies (`src/service/policies-rest-api*.test.ts`)

Shared types and permission constants are covered in [`@backstage-community/plugin-rbac-common`](../rbac-common/CONTRIBUTING.md).

## Optional manual smoke checklist

After changing route registration or bumping `@backstage/*` dependencies:

1. Start the backend harness (`start` or `start:manual-tests`).
2. Readiness:

   ```bash
   curl -sf http://localhost:7007/.backstage/health/v1/readiness
   ```

3. List roles (guest dev token):

   ```bash
   TOKEN=$(curl -s http://localhost:7007/api/auth/guest/refresh -X POST \
     -H 'Content-Type: application/json' -d '{}' \
     | python3 -c "import sys,json; print(json.load(sys.stdin)['backstageIdentity']['token'])")
   curl -H "Authorization: Bearer ${TOKEN}" http://localhost:7007/api/permission/roles
   ```

REST endpoint reference: [docs/apis.md](./docs/apis.md).

Multi-user, credential-backed, or production-like end-to-end testing belongs in a consumer Backstage deployment — not a newly scaffolded in-repo full app.

## Related packages

- [RBAC frontend plugin](../rbac/CONTRIBUTING.md)
- [RBAC common library](../rbac-common/CONTRIBUTING.md)
