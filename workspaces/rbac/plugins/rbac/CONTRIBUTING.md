# Contributing — RBAC frontend plugin

Developer guide for `@backstage-community/plugin-rbac`. For administrator install steps, see [README.md](./README.md).

## Prerequisites

- Node.js **22+**
- Yarn (community-plugins monorepo lockfile)

## Development harness

Start the frontend plugin in isolation (mock backend):

```bash
yarn workspace @backstage-community/plugin-rbac start:mock
```

Alpha API entrypoint:

```bash
yarn workspace @backstage-community/plugin-rbac start:alpha:mock
```

This is the default frontend workflow. Playwright UI tests also use `start:mock` (no live backend).

### Multi-user testing with Keycloak

To test the RBAC UI with real permissions across multiple users, run the frontend alongside the backend and Keycloak. The sign-in page shows both **Guest** and **Keycloak OIDC** options.

```bash
# Terminal 1 — Keycloak
yarn workspace @backstage-community/plugin-rbac-backend start:keycloak

# Terminal 2 — backend with OIDC
yarn workspace @backstage-community/plugin-rbac-backend start:multi-user

# Terminal 3 — frontend with OIDC sign-in
yarn workspace @backstage-community/plugin-rbac start:multi-user
```

Open http://localhost:3000, click **Keycloak OIDC**, and log in as any test user (e.g. `admin` / `test`). See the [backend CONTRIBUTING](../rbac-backend/CONTRIBUTING.md) for the full list of 42 test users and their RBAC policies.

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
