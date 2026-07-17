# Manual RBAC tests (backend-only)

Run RBAC permission checks against all **42** superhero catalog users without a Backstage frontend. The flow uses:

- **Keycloak** (`backstage` realm) for OIDC sign-in
- **Backend dev server** with CSV policies from `plugins/rbac-backend/manual-tests/rbac/rbac-policy.csv`
- **HTTP scripts** to obtain bearer tokens and call `/api/permission/authorize`

## Prerequisites

- Node.js 22+ and Yarn
- **Docker** (for Keycloak)
- Optional: PostgreSQL via `plugins/rbac-backend/app-config.local.yaml` (default harness uses in-memory SQLite from `plugins/rbac-backend/app-config.yaml`)

## Quick start

Run all commands from the **RBAC workspace root** (`workspaces/rbac`):

```bash
cd workspaces/rbac
yarn install
```

### 1. Start Keycloak

Start Keycloak **before** the Backstage backend so OIDC metadata is available on first login.

```bash
yarn workspace @backstage-community/plugin-rbac-backend start:keycloak
```

Keycloak admin: http://localhost:8080/admin (`admin` / `admin`).
Realm `backstage` is auto-imported from `manual-tests/keycloak/backstage-realm.json`.

All test users use password `test` (for example `ant_man@example.com`).

### 2. Start the RBAC backend (no frontend)

In a second terminal, still from `workspaces/rbac`:

```bash
yarn workspace @backstage-community/plugin-rbac-backend start:manual-tests
```

This loads `plugins/rbac-backend/app-config.yaml` + `app-config.manual-tests.yaml` (OIDC, catalog entities, CSV policies, admin/superUser config).

If OIDC login returns `500 ECONNREFUSED`, restart the backend after Keycloak is healthy.

Health check:

```bash
curl -sf http://localhost:7007/.backstage/health/v1/readiness
```

### 3. Log in and obtain tokens (all 42 users)

```bash
python3 plugins/rbac-backend/manual-tests/scripts/generate-userinfo.py
node plugins/rbac-backend/manual-tests/scripts/login.mjs \
  --csv plugins/rbac-backend/manual-tests/userinfo.csv
```

Or a single user:

```bash
node plugins/rbac-backend/manual-tests/scripts/login.mjs --user ant_man
```

The login script performs the OIDC redirect flow against `/api/auth/oidc/start` using only Node.js built-ins (no npm dependencies). `FRONTEND_URL` defaults to `http://localhost:3000` and is only used as the auth `origin` parameter.

**Important:** bearer tokens in `userinfo.csv` are tied to the running backend instance. After every backend restart (in-memory SQLite resets auth keys), re-run `login.mjs` before `test-permissions.sh`. A `401 Failed user token verification` error means the tokens are stale.

Regenerate `userinfo.csv` after changing expected results:

```bash
python3 plugins/rbac-backend/manual-tests/scripts/generate-userinfo.py
```

### 4. Verify ALLOW / DENY (all 42 users)

```bash
./plugins/rbac-backend/manual-tests/scripts/test-permissions.sh
```

## Files

| Path                                                               | Purpose                                          |
| ------------------------------------------------------------------ | ------------------------------------------------ |
| `plugins/rbac-backend/manual-tests/rbac/all.yaml`                  | Catalog location for superhero users/groups      |
| `plugins/rbac-backend/manual-tests/rbac/rbac-policy.csv`           | Casbin CSV policies (42 hierarchy test cases)    |
| `plugins/rbac-backend/manual-tests/rbac/users.yaml`, `groups.yaml` | Catalog entities                                 |
| `plugins/rbac-backend/manual-tests/keycloak/backstage-realm.json`  | Keycloak realm with matching users               |
| `plugins/rbac-backend/manual-tests/userinfo.csv`                   | Login + test matrix for all 42 users             |
| `start:keycloak` script in `package.json`                          | Run Keycloak with realm import (Docker)          |
| `plugins/rbac-backend/manual-tests/scripts/login.mjs`              | OIDC login → Backstage bearer token (Node.js)    |
| `plugins/rbac-backend/manual-tests/scripts/generate-userinfo.py`   | Regenerate `userinfo.csv` from test expectations |
| `plugins/rbac-backend/manual-tests/scripts/test-permissions.sh`    | POST `/api/permission/authorize` for every user  |
| `plugins/rbac-backend/app-config.manual-tests.yaml`                | Backend overlay config                           |

## Environment variables

| Variable                | Default                 | Description                                              |
| ----------------------- | ----------------------- | -------------------------------------------------------- |
| `BASE_URL`              | `http://localhost:7007` | Backstage backend URL                                    |
| `FRONTEND_URL`          | `http://localhost:3000` | Auth flow origin (no UI needed)                          |
| `KEYCLOAK_HOST_REWRITE` | _(empty)_               | e.g. `keycloak:8080=localhost:8080` in Docker Compose    |
| `CSV_FILE`              | `../userinfo.csv`       | Path for `test-permissions.sh` (relative to scripts dir) |
| `KEYCLOAK_PORT`         | `8080`                  | Keycloak host port                                       |

## Guest auth (smoke test)

The dev backend also registers the guest provider. Without Keycloak:

```bash
TOKEN=$(curl -s http://localhost:7007/api/auth/guest/refresh \
  -X POST -H 'Content-Type: application/json' -d '{}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['backstageIdentity']['token'])")

curl -s http://localhost:7007/api/permission/authorize \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"items":[{"id":"1","permission":{"name":"catalog.entity.read","type":"resource","resourceType":"catalog-entity","attributes":{"action":"read"}},"resourceRef":"component:default/x"}]}'
```

Guest users are not in the CSV policy file, so catalog read is typically **DENY** unless configured as admin.

## API reference

RBAC REST endpoints: [`plugins/rbac-backend/docs/apis.md`](../docs/apis.md)

Hierarchy test cases mirror [`plugins/rbac-backend/src/policies/permission-policy.hierarchy.test.ts`](../src/policies/permission-policy.hierarchy.test.ts).
