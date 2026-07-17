# Contributing — RBAC backend plugin

Developer guide for `@backstage-community/plugin-rbac-backend`. For operator install and configuration, see [README.md](./README.md).

## Prerequisites

- Node.js **22+** (see workspace `engines` in the workspace root `package.json`)
- Yarn (community-plugins monorepo lockfile)
- **Docker** — only for multi-user permission testing with Keycloak (port **8080**)

## Development harness

The plugin has two dev harness modes — single-user with guest auth and multi-user with Keycloak OIDC. Both run without a frontend.

| Goal                         | Command                                                         |
| ---------------------------- | --------------------------------------------------------------- |
| Backend / REST / policy work | `yarn workspace @backstage-community/plugin-rbac-backend start` |
| UI work (mocked APIs)        | `yarn workspace @backstage-community/plugin-rbac start:mock`    |
| Multi-user permission smoke  | `start:keycloak` + `start:multi-user`                           |

Sample non-secret config keys live in [`app-config.yaml`](./app-config.yaml) beside this package. Optional overrides: untracked `app-config.local.yaml` in the same directory. Only one backend `dev/` harness should listen on port **7007** at a time.

### Single-user testing (guest auth, no Keycloak)

```bash
yarn workspace @backstage-community/plugin-rbac-backend start
```

The guest user (`user:development/guest`) is configured as the RBAC admin in [`app-config.yaml`](./app-config.yaml). Get a token and test permissions:

```bash
TOKEN=$(curl -s http://localhost:7007/api/auth/guest/refresh -X POST \
  -H 'Content-Type: application/json' -d '{}' \
  | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>console.log(JSON.parse(d).backstageIdentity.token))")

curl -s -H "Authorization: Bearer $TOKEN" \
  http://localhost:7007/api/permission/authorize \
  -X POST -H 'Content-Type: application/json' \
  -d '{"items":[{"id":"1","resourceRef":"component:default/x","permission":{"name":"catalog.entity.read","type":"resource","resourceType":"catalog-entity","attributes":{"action":"read"}}}]}'
```

The guest admin user gets **ALLOW** for `catalog.entity.read`. To verify **DENY** behavior, remove `user:development/guest` from `permission.rbac.admin.users` in `app-config.yaml` and restart.

List roles:

```bash
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:7007/api/permission/roles
```

### Multi-user testing (Keycloak + OIDC)

For testing RBAC policies across multiple users and group hierarchies, the workspace includes 42 superhero test users with pre-configured Casbin CSV policies covering basic RBAC test cases: direct user roles, group-based roles, hierarchical groups, bidirectional group links, and admin/superUser configuration. Test data is in [`__fixtures__/rbac/`](./__fixtures__/rbac/).

Start Keycloak with realm import (terminal 1):

```bash
yarn workspace @backstage-community/plugin-rbac-backend start:keycloak
```

Keycloak admin: http://localhost:8080/admin (`admin` / `admin`).
Realm `backstage` is auto-imported from [`__fixtures__/keycloak/backstage-realm.json`](./__fixtures__/keycloak/backstage-realm.json). All test users use password `test`.

Start the backend with OIDC overlay (terminal 2, after Keycloak is healthy):

```bash
yarn workspace @backstage-community/plugin-rbac-backend start:multi-user
```

This loads `app-config.yaml` + [`app-config.multi-user.yaml`](./app-config.multi-user.yaml) (OIDC provider, catalog entities from `__fixtures__/rbac/`, CSV policies, admin/superUser config).

Get a token and check a user's `catalog.entity.read` permission:

```bash
TOKEN=$(npx @oandriie/backstage-login-helper@^0.3.0 --user ant_man --password test)

curl -s -H "Authorization: Bearer $TOKEN" \
  http://localhost:7007/api/permission/authorize \
  -X POST -H 'Content-Type: application/json' \
  -d '{"items":[{"id":"1","resourceRef":"component:default/artist-lookup","permission":{"name":"catalog.entity.read","type":"resource","resourceType":"catalog-entity","attributes":{"action":"read"}}}]}'
```

Expected: `ant_man` → ALLOW, `hulk` → DENY.

The login helper ([`@oandriie/backstage-login-helper`](https://github.com/AndrienkoAleksandr/backstage-login-helper)) runs via `npx` — no install needed. It performs the OIDC redirect flow against `/api/auth/oidc/start` using only Node.js built-ins.

### Troubleshooting

| Symptom                           | Likely cause                      | Fix                                                      |
| --------------------------------- | --------------------------------- | -------------------------------------------------------- |
| `ECONNREFUSED` on port 8080       | Keycloak not running              | Run `start:keycloak` first                               |
| `500` on OIDC login               | Keycloak not ready at startup     | Restart the backend after Keycloak is healthy            |
| `No Keycloak login form found`    | Backend not running or wrong port | Confirm `Listening on :7007` in backend logs             |
| `Invalid parameter: redirect_uri` | Stale Keycloak container          | Stop/remove the container and run `start:keycloak` again |

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

REST endpoint reference: [docs/apis.md](./docs/apis.md).

## Related packages

- [RBAC frontend plugin](../rbac/CONTRIBUTING.md)
- [RBAC common library](../rbac-common/CONTRIBUTING.md)
