# Contributing — RBAC common library

Developer guide for `@backstage-community/plugin-rbac-common`. For package overview, see [README.md](./README.md).

## Prerequisites

- Node.js **22+**
- Yarn (community-plugins monorepo lockfile)

## Development

This package is a shared types and permission-constants library. There is no standalone backend or frontend `dev/` harness.

Work on it from `workspaces/rbac`:

```bash
yarn workspace @backstage-community/plugin-rbac-common test
yarn workspace @backstage-community/plugin-rbac-common lint:check
yarn tsc
```

## Contract tests

`src/contract.test.ts` locks the public API surface used by `@backstage-community/plugin-rbac-backend` and `@backstage-community/plugin-rbac`:

- Policy-entity permission names and `policyEntityPermissions` ordering
- `RESOURCE_TYPE_POLICY_ENTITY`
- `isResourcedPolicy`, `isValidPermissionAction`, `toPermissionAction`
- `ConditionalAliases` and `UnauthorizedError`

Run contract tests after bumps to `@backstage/plugin-permission-common` or when changing exported symbols.

## Related packages

- [RBAC backend plugin](../rbac-backend/CONTRIBUTING.md)
- [RBAC frontend plugin](../rbac/CONTRIBUTING.md)
