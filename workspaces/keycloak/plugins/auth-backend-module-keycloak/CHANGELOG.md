# @backstage-community/plugin-auth-backend-module-keycloak-provider

## 0.5.1

### Patch Changes

- 040750f: Add contributor guides, dev harnesses, and bump-trust test coverage for the Keycloak auth and catalog backend modules.

  - Auth: `dev/` harness, module wiring and auth↔catalog sanitization contract tests
  - Catalog: transformer extension-point, schedule contract, batch-failure metrics, and `ensureTokenValid` tests
  - Workspace: README index and CONTRIBUTING guides with validation/smoke checklists

## 0.5.0

### Minor Changes

- 70d7508: Backstage version bump to v1.53.0

## 0.4.0

### Minor Changes

- b4fd326: Backstage version bump to v1.52.0

## 0.3.0

### Minor Changes

- e1a38d3: Backstage version bump to v1.51.0

## 0.2.1

### Patch Changes

- 91cf6e0: Mark the Keycloak auth provider config with @visibility frontend and add resolver details to config.d.ts

## 0.2.0

### Minor Changes

- ab4faa6: added `oidcSubClaimMatchingKeycloakUserId` and `ldapUuidMatchingAnnotation` sign-in resolvers

## 0.1.0

### Minor Changes

- 5ff2dfd: Added a new auth provider backend module for Keycloak.
