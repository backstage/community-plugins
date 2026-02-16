# @backstage-community/plugin-mend-backend

## 1.0.0

### Major Changes

- bc3cc34: - Updated Frontend system to provide the Backstage Portal Support

  - **BREAKING** The permission-policy-based project filtering has been removed in favor of configuration-based `mend.permissionControl`. This is only applicable if you previously used the Mend permissions in your `PermissionPolicy` to control which project IDs are visible.

  Previously, you might have configured project filtering like this in your organization policy:

  ```ts
  // ... other imports here
  import {
    mendReadPermission,
    mendConditions,
    createMendProjectConditionalDecision,
  } from '@backstage-community/plugin-mend-backend';

  export class OrganizationPolicy implements PermissionPolicy {
    async handle(
      request: PolicyQuery,
      user?: BackstageIdentityResponse,
    ): Promise<PolicyDecision> {
      if (isPermission(request.permission, mendReadPermission)) {
        return createMendProjectConditionalDecision(
          request.permission,
          mendConditions.filter({
            ids: [], // List of project ids
            exclude: true, // Default
          }),
        );
      }

      // ... other conditions
      return {
        result: AuthorizeResult.ALLOW,
      };
    }
  }
  ```

  You must now configure the equivalent behavior via `app-config.yaml`:

  ```yaml
  mend:
    activationKey: ${MEND_ACTIVATION_KEY}
    permissionControl:
      ids:
        - <project-uuid-1> # Project UUID to filter
        - <project-uuid-2> # Another project UUID
      exclude: true # true = blocklist (exclude these), false = allowlist (only these)
  ```

  Migration steps:

  1. Copy the same `ids` list and `exclude` value you used in your permission policy into the `mend.permissionControl` configuration in `app-config.yaml`.
  2. Remove the permission-related code (such as `mendReadPermission`, `mendConditions`, and `createMendProjectConditionalDecision` usage) from your custom permission policy file (for example, `packages/backend/src/plugins/permission.ts`).
  3. Remove the Mend permission imports from `packages/backend/src/index.ts` and ensure your default policy continues to allow access (for example, by using an allow-all-policy if no other policy is defined).

  ```diff
  backend.add(import('@backstage/plugin-permission-backend'));
  + backend.add(
  +   import('@backstage/plugin-permission-backend-module-allow-all-policy'),
  +  );
  - backend.add(import('./plugins/permission'));
  ```

### Patch Changes

- b133c9d: Updated dependency `@types/supertest` to `^6.0.0`.

## 0.10.0

### Minor Changes

- 12af0ed: Backstage version bump to v1.46.1

## 0.9.1

### Patch Changes

- 6d3ed24: Updated dependency `supertest` to `^7.0.0`.

## 0.9.0

### Minor Changes

- f48c4f9: Backstage version bump to v1.44.0

## 0.8.0

### Minor Changes

- 063ba67: Backstage version bump to v1.43.2

## 0.7.0

### Minor Changes

- d85e394: Removed the `baseUrl` field from the Backstage configuration; now derived using the `activationKey`.
  Enhanced drill-down functionality to filter projects on the Findings Overview page using the `sourceUrl`.
  Added support for displaying projects with `sourceUrl` from GitLab, Bitbucket, and Azure Repos.
  Updated branding text from `mend.io` to `Mend.io`.
  Improved and repositioned the Project Name multi-select filter on the Findings Overview page.
  Added tooltip for the Project Name multi-select filter.

## 0.6.0

### Minor Changes

- a2803e9: Backstage version bump to v1.42.3

## 0.5.0

### Minor Changes

- caba2d1: Fixed Issue #4856 – Updated the logic to map projects and Backstage entities based on the repository URL instead of the project name.
  Resolved an issue where multiple projects sharing the same `sourceUrl` were not all being displayed.
  Enhanced the Finding Overview tab by adding a multi-select filter and a new column to display the Project Name in the Findings table.

## 0.4.1

### Patch Changes

- a6e6de7: Updated the targetPluginId from 'plugin.catalog.service' to 'catalog' to get the correct token

## 0.4.0

### Minor Changes

- 4ccd86f: Backstage version bump to v1.40.2

## 0.3.0

### Minor Changes

- 6d13cab: Backstage version bump to v1.37.0

## 0.2.0

### Minor Changes

- 0d01419: Backstage version bump to v1.35.1

## 0.1.1

### Patch Changes

- 31e9be5: Updates to fix the API Reports

## 0.1.0

### Minor Changes

- 898b5f1: Initial release of the `@backstage-community/plugin-mend-backend` plugin.

### Patch Changes

- 49378e1: Updated dependency `path-to-regexp` to `^8.0.0`
