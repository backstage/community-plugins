# Contributing — RBAC frontend plugin

Developer guide for `@backstage-community/plugin-rbac`. For administrator install steps, see [README.md](./README.md).

## Prerequisites

- Node.js **22+**
- Yarn (workspace lockfile at `workspaces/rbac/yarn.lock`)

## Development harness

Start the frontend plugin in isolation (mock backend):

```bash
yarn workspace @backstage-community/plugin-rbac start:mock
```

Legacy (pre-NFS) entrypoint:

```bash
yarn workspace @backstage-community/plugin-rbac start:legacy:mock
```

This is the default frontend workflow. Playwright UI tests also use `start:mock` (no live backend).

### Multi-user testing with Keycloak

To test the RBAC UI with real permissions across multiple users. Multi-user mode requires environment variables for secrets — see the [backend CONTRIBUTING](../rbac-backend/CONTRIBUTING.md#multi-user-testing-keycloak--oidc) for the full variable list, 42 test users, and RBAC policies.

After setting the variables, start Keycloak and run both frontend + backend with a single command from `workspaces/rbac`:

```bash
# Terminal 1 — Keycloak
yarn workspace @backstage-community/plugin-rbac-backend start:keycloak

# Terminal 2 — frontend + backend with OIDC
yarn start:multi-user
```

Open http://localhost:3000, click **Keycloak OIDC**, and log in as any test user (e.g. `admin` / `test`).

## Validation commands

From `workspaces/rbac`:

```bash
yarn workspace @backstage-community/plugin-rbac test
yarn workspace @backstage-community/plugin-rbac lint:check
yarn workspace @backstage-community/plugin-rbac ui-test
yarn tsc
```

## Optional manual smoke checklist

1. `yarn workspace @backstage-community/plugin-rbac start:mock` — confirm RBAC page renders with mock data.
2. For real API behavior, use the backend harness + `curl` (see [backend CONTRIBUTING](../rbac-backend/CONTRIBUTING.md)).

REST and policy administration APIs: [rbac-backend docs/apis.md](../rbac-backend/docs/apis.md).

## Related packages

- [RBAC backend plugin](../rbac-backend/CONTRIBUTING.md)
- [RBAC common library](../rbac-common/CONTRIBUTING.md)
