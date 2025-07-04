# @backstage-community/plugin-azure-sites-common

## 0.7.0

### Minor Changes

- 5d47950: Backstage version bump to v1.40.2

## 0.6.0

### Minor Changes

- 554b8d9: Backstage version bump to v1.38.1

## 0.5.0

### Minor Changes

- 044529a: Backstage version bump to v1.37.0

## 0.4.0

### Minor Changes

- c149be8: Backstage version bump to v1.36.1

## 0.3.0

### Minor Changes

- 09b2057: Backstage version bump to v1.35.1

## 0.2.0

### Minor Changes

- 486d59b: Backstage version bump to v1.34.1

## 0.1.8

### Patch Changes

- 58c28d3: Backstage version bump to v1.32.2

## 0.1.7

### Patch Changes

- bbf2c19: Backstage version bump to v1.31.1

## 0.1.6

### Patch Changes

- 558cdfd: Backstage version bump to v1.30.2

## 0.1.5

### Patch Changes

- 833451a: version:bump to v1.29.1

## 0.1.4

### Patch Changes

- 193a2a3: Migrated from the [backstage/backstage](https://github.com/backstage/backstage) monorepo.

## 0.1.3

### Patch Changes

- Updated dependencies
  - @backstage/plugin-permission-common@0.7.13
  - @backstage/catalog-model@1.4.5
  - @backstage/plugin-catalog-common@1.0.22

## 0.1.3-next.1

### Patch Changes

- Updated dependencies
  - @backstage/plugin-permission-common@0.7.13-next.1
  - @backstage/catalog-model@1.4.5-next.0
  - @backstage/plugin-catalog-common@1.0.22-next.1

## 0.1.3-next.0

### Patch Changes

- Updated dependencies
  - @backstage/plugin-permission-common@0.7.13-next.0
  - @backstage/catalog-model@1.4.5-next.0
  - @backstage/plugin-catalog-common@1.0.22-next.0

## 0.1.2

### Patch Changes

- 5a409bb: Azure Sites `start` and `stop` action is now protected with the Permissions framework.

  The below example describes an action that forbids anyone but the owner of the catalog entity to trigger actions towards a site tied to an entity.

  ```typescript
     // packages/backend/src/plugins/permission.ts
    import { azureSitesActionPermission } from '@backstage-community/plugin-azure-sites-common';
     ...
     class TestPermissionPolicy implements PermissionPolicy {
    async handle(request: PolicyQuery, user?: BackstageIdentityResponse): Promise<PolicyDecision> {
       if (isPermission(request.permission, azureSitesActionPermission)) {
         return createCatalogConditionalDecision(
           request.permission,
           catalogConditions.isEntityOwner({
             claims: user?.identity.ownershipEntityRefs ??  [],
           }),
         );
       }
       ...
       return {
         result: AuthorizeResult.ALLOW,
       };
     }
     ...
     }
  ```

- Updated dependencies
  - @backstage/catalog-model@1.4.4
  - @backstage/plugin-catalog-common@1.0.21
  - @backstage/plugin-permission-common@0.7.12

## 0.1.2-next.0

### Patch Changes

- 5a409bb: Azure Sites `start` and `stop` action is now protected with the Permissions framework.

  The below example describes an action that forbids anyone but the owner of the catalog entity to trigger actions towards a site tied to an entity.

  ```typescript
     // packages/backend/src/plugins/permission.ts
    import { azureSitesActionPermission } from '@backstage-community/plugin-azure-sites-common';
     ...
     class TestPermissionPolicy implements PermissionPolicy {
    async handle(request: PolicyQuery, user?: BackstageIdentityResponse): Promise<PolicyDecision> {
       if (isPermission(request.permission, azureSitesActionPermission)) {
         return createCatalogConditionalDecision(
           request.permission,
           catalogConditions.isEntityOwner({
             claims: user?.identity.ownershipEntityRefs ??  [],
           }),
         );
       }
       ...
       return {
         result: AuthorizeResult.ALLOW,
       };
     }
     ...
     }
  ```

- Updated dependencies
  - @backstage/catalog-model@1.4.4-next.0
  - @backstage/plugin-catalog-common@1.0.21-next.0
  - @backstage/plugin-permission-common@0.7.12

## 0.1.1

### Patch Changes

- 406b786a2a2c: Mark package as being free of side effects, allowing more optimized Webpack builds.

## 0.1.1-next.0

### Patch Changes

- 406b786a2a2c: Mark package as being free of side effects, allowing more optimized Webpack builds.

## 0.1.0

### Minor Changes

- 4a75ce761c: Azure Sites (Apps & Functions) support for a given entity. View the current status of the site, quickly jump to site's Overview page, or Log Stream page.

## 0.1.0-next.0

### Minor Changes

- 4a75ce761c: Azure Sites (Apps & Functions) support for a given entity. View the current status of the site, quickly jump to site's Overview page, or Log Stream page.
