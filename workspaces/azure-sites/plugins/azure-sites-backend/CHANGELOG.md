# @backstage-community/plugin-azure-sites-backend

## 0.3.5

### Patch Changes

- 193a2a3: Migrated from the [backstage/backstage](https://github.com/backstage/backstage) monorepo.
- Updated dependencies [193a2a3]
  - @backstage-community/plugin-azure-sites-common@0.1.4

## 0.3.4

### Patch Changes

- d5a1fe1: Replaced winston logger with `LoggerService`
- Updated dependencies
  - @backstage/backend-common@0.21.7
  - @backstage/plugin-permission-node@0.7.28
  - @backstage/backend-plugin-api@0.6.17
  - @backstage/catalog-client@1.6.4
  - @backstage/plugin-catalog-node@1.11.1
  - @backstage/config@1.2.0
  - @backstage/errors@1.2.4
  - @backstage-community/plugin-azure-sites-common@0.1.3
  - @backstage/plugin-permission-common@0.7.13

## 0.3.4-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.21.7-next.1
  - @backstage/backend-plugin-api@0.6.17-next.1
  - @backstage/catalog-client@1.6.4-next.0
  - @backstage/plugin-permission-node@0.7.28-next.1
  - @backstage/config@1.2.0
  - @backstage/errors@1.2.4
  - @backstage-community/plugin-azure-sites-common@0.1.3
  - @backstage/plugin-catalog-node@1.11.1-next.1
  - @backstage/plugin-permission-common@0.7.13

## 0.3.4-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.21.7-next.0
  - @backstage/backend-plugin-api@0.6.17-next.0
  - @backstage/catalog-client@1.6.3
  - @backstage/config@1.2.0
  - @backstage/errors@1.2.4
  - @backstage-community/plugin-azure-sites-common@0.1.3
  - @backstage/plugin-catalog-node@1.11.1-next.0
  - @backstage/plugin-permission-common@0.7.13
  - @backstage/plugin-permission-node@0.7.28-next.0

## 0.3.3

### Patch Changes

- Updated dependencies
  - @backstage/plugin-catalog-node@1.11.0
  - @backstage/catalog-client@1.6.3
  - @backstage/backend-common@0.21.6
  - @backstage/backend-plugin-api@0.6.16
  - @backstage/plugin-permission-node@0.7.27
  - @backstage/config@1.2.0
  - @backstage/errors@1.2.4
  - @backstage-community/plugin-azure-sites-common@0.1.3
  - @backstage/plugin-permission-common@0.7.13

## 0.3.2

### Patch Changes

- Updated dependencies
  - @backstage/plugin-catalog-node@1.10.0
  - @backstage/catalog-client@1.6.2
  - @backstage/backend-common@0.21.5
  - @backstage/plugin-permission-node@0.7.26
  - @backstage/backend-plugin-api@0.6.15
  - @backstage/config@1.2.0
  - @backstage/errors@1.2.4
  - @backstage-community/plugin-azure-sites-common@0.1.3
  - @backstage/plugin-permission-common@0.7.13

## 0.3.1

### Patch Changes

- Updated dependencies
  - @backstage/plugin-catalog-node@1.9.0

## 0.3.0

### Minor Changes

- 6b802a2: **BREAKING**: The `createRouter` method now requires the `discovery` service to be forwarded from the plugin environment. This is part of the migration to support new auth services.
- acf3e00: Azure Sites list now hides the internal/microsoft only `hidden-` tags from the list of tags that are returned. Updated the log endpoint to /logstream-quickstart rather than just /logstream to stream logs in the Azure Portal UI.

### Patch Changes

- 2bd1410: Removed unused dependencies
- 4467036: Allow unauthenticated access to health check endpoint.
- 85db926: Added new backend system for the Azure Sites backend plugin
- Updated dependencies
  - @backstage/backend-common@0.21.4
  - @backstage/config@1.2.0
  - @backstage/errors@1.2.4
  - @backstage/backend-plugin-api@0.6.14
  - @backstage/plugin-permission-common@0.7.13
  - @backstage/plugin-catalog-node@1.8.0
  - @backstage/catalog-client@1.6.1
  - @backstage/plugin-permission-node@0.7.25
  - @backstage-community/plugin-azure-sites-common@0.1.3

## 0.3.0-next.2

### Minor Changes

- acf3e00: Azure Sites list now hides the internal/microsoft only `hidden-` tags from the list of tags that are returned. Updated the log endpoint to /logstream-quickstart rather than just /logstream to stream logs in the Azure Portal UI.

### Patch Changes

- 2bd1410: Removed unused dependencies
- Updated dependencies
  - @backstage/catalog-client@1.6.1-next.1
  - @backstage/backend-common@0.21.4-next.2
  - @backstage/plugin-catalog-node@1.8.0-next.2
  - @backstage/backend-plugin-api@0.6.14-next.2
  - @backstage/config@1.2.0-next.1
  - @backstage/errors@1.2.4-next.0
  - @backstage-community/plugin-azure-sites-common@0.1.3-next.1
  - @backstage/plugin-permission-common@0.7.13-next.1
  - @backstage/plugin-permission-node@0.7.25-next.2

## 0.3.0-next.1

### Patch Changes

- Updated dependencies
  - @backstage/config@1.2.0-next.1
  - @backstage/backend-common@0.21.4-next.1
  - @backstage/backend-plugin-api@0.6.14-next.1
  - @backstage/plugin-auth-node@0.4.9-next.1
  - @backstage/plugin-permission-common@0.7.13-next.1
  - @backstage/plugin-permission-node@0.7.25-next.1
  - @backstage/catalog-client@1.6.1-next.0
  - @backstage/catalog-model@1.4.5-next.0
  - @backstage/errors@1.2.4-next.0
  - @backstage-community/plugin-azure-sites-common@0.1.3-next.1
  - @backstage/plugin-catalog-node@1.8.0-next.1

## 0.3.0-next.0

### Minor Changes

- 6b802a2: **BREAKING**: The `createRouter` method now requires the `discovery` service to be forwarded from the plugin environment. This is part of the migration to support new auth services.

### Patch Changes

- 85db926: Added new backend system for the Azure Sites backend plugin
- Updated dependencies
  - @backstage/backend-common@0.21.3-next.0
  - @backstage/plugin-auth-node@0.4.8-next.0
  - @backstage/errors@1.2.4-next.0
  - @backstage/backend-plugin-api@0.6.13-next.0
  - @backstage/plugin-permission-common@0.7.13-next.0
  - @backstage/plugin-catalog-node@1.8.0-next.0
  - @backstage/plugin-permission-node@0.7.24-next.0
  - @backstage/catalog-client@1.6.1-next.0
  - @backstage/catalog-model@1.4.5-next.0
  - @backstage/config@1.1.2-next.0
  - @backstage-community/plugin-azure-sites-common@0.1.3-next.0

## 0.2.0

### Minor Changes

- 28610f4: **BREAKING**: `catalogApi` and `permissionsApi` are now a requirement to be passed through to the `createRouter` function.

  You can fix the typescript issues by passing through the required dependencies like the below `diff` shows:

  ```diff
    import {
      createRouter,
      AzureSitesApi,
    } from '@backstage-community/plugin-azure-sites-backend';
    import { Router } from 'express';
    import { PluginEnvironment } from '../types';

    export default async function createPlugin(
      env: PluginEnvironment,
    ): Promise<Router> {
  +   const catalogClient = new CatalogClient({
  +     discoveryApi: env.discovery,
  +   });

      return await createRouter({
        logger: env.logger,
        azureSitesApi: AzureSitesApi.fromConfig(env.config),
  +     catalogApi: catalogClient,
  +     permissionsApi: env.permissions,
      });
    }
  ```

### Patch Changes

- 9aac2b0: Use `--cwd` as the first `yarn` argument
- 4376655: Added `permissionIntegrationRouter` for azure-sites-backend routes
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
  - @backstage/backend-common@0.21.0
  - @backstage/plugin-auth-node@0.4.4
  - @backstage/catalog-model@1.4.4
  - @backstage/catalog-client@1.6.0
  - @backstage-community/plugin-azure-sites-common@0.1.2
  - @backstage/plugin-permission-node@0.7.21
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3
  - @backstage/plugin-permission-common@0.7.12

## 0.2.0-next.3

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.21.0-next.3
  - @backstage/plugin-auth-node@0.4.4-next.3
  - @backstage/plugin-permission-node@0.7.21-next.3
  - @backstage/catalog-client@1.6.0-next.1
  - @backstage/catalog-model@1.4.4-next.0
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3
  - @backstage-community/plugin-azure-sites-common@0.1.2-next.0
  - @backstage/plugin-permission-common@0.7.12

## 0.2.0-next.2

### Patch Changes

- 9aac2b0: Use `--cwd` as the first `yarn` argument
- 4376655: Added `permissionIntegrationRouter` for azure-sites-backend routes
- Updated dependencies
  - @backstage/backend-common@0.21.0-next.2
  - @backstage/plugin-auth-node@0.4.4-next.2
  - @backstage/plugin-permission-node@0.7.21-next.2
  - @backstage/config@1.1.1
  - @backstage/catalog-client@1.6.0-next.1
  - @backstage/catalog-model@1.4.4-next.0
  - @backstage/errors@1.2.3
  - @backstage-community/plugin-azure-sites-common@0.1.2-next.0
  - @backstage/plugin-permission-common@0.7.12

## 0.2.0-next.1

### Minor Changes

- 28610f4: **BREAKING**: `catalogApi` and `permissionsApi` are now a requirement to be passed through to the `createRouter` function.

  You can fix the typescript issues by passing through the required dependencies like the below `diff` shows:

  ```diff
    import {
      createRouter,
      AzureSitesApi,
    } from '@backstage-community/plugin-azure-sites-backend';
    import { Router } from 'express';
    import { PluginEnvironment } from '../types';

    export default async function createPlugin(
      env: PluginEnvironment,
    ): Promise<Router> {
  +   const catalogClient = new CatalogClient({
  +     discoveryApi: env.discovery,
  +   });

      return await createRouter({
        logger: env.logger,
        azureSitesApi: AzureSitesApi.fromConfig(env.config),
  +     catalogApi: catalogClient,
  +     permissionsApi: env.permissions,
      });
    }
  ```

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
  - @backstage/catalog-client@1.6.0-next.1
  - @backstage/backend-common@0.21.0-next.1
  - @backstage-community/plugin-azure-sites-common@0.1.2-next.0
  - @backstage/config@1.1.1
  - @backstage/errors@1.2.3
  - @backstage/plugin-auth-node@0.4.4-next.1
  - @backstage/plugin-permission-common@0.7.12
  - @backstage/plugin-permission-node@0.7.21-next.1

## 0.1.20-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.21.0-next.0
  - @backstage/config@1.1.1
  - @backstage-community/plugin-azure-sites-common@0.1.1

## 0.1.19

### Patch Changes

- 4016f21: Remove some unused dependencies
- Updated dependencies
  - @backstage/backend-common@0.20.1
  - @backstage/config@1.1.1
  - @backstage-community/plugin-azure-sites-common@0.1.1

## 0.1.19-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.20.1-next.2

## 0.1.19-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.20.1-next.1
  - @backstage/config@1.1.1
  - @backstage-community/plugin-azure-sites-common@0.1.1

## 0.1.19-next.0

### Patch Changes

- 4016f21: Remove some unused dependencies
- Updated dependencies
  - @backstage/backend-common@0.20.1-next.0
  - @backstage/config@1.1.1
  - @backstage-community/plugin-azure-sites-common@0.1.1

## 0.1.18

### Patch Changes

- 99fb541: Updated dependency `@azure/identity` to `^4.0.0`.
- b7a13ed: Updated dependency `@azure/arm-appservice` to `^14.0.0`.
- Updated dependencies
  - @backstage/backend-common@0.20.0
  - @backstage/config@1.1.1
  - @backstage-community/plugin-azure-sites-common@0.1.1

## 0.1.18-next.3

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.20.0-next.3
  - @backstage/config@1.1.1
  - @backstage-community/plugin-azure-sites-common@0.1.1

## 0.1.18-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.20.0-next.2
  - @backstage/config@1.1.1
  - @backstage-community/plugin-azure-sites-common@0.1.1

## 0.1.18-next.1

### Patch Changes

- 99fb54183b: Updated dependency `@azure/identity` to `^4.0.0`.
- Updated dependencies
  - @backstage/backend-common@0.20.0-next.1
  - @backstage/config@1.1.1
  - @backstage-community/plugin-azure-sites-common@0.1.1

## 0.1.18-next.0

### Patch Changes

- b7a13edf6d: Updated dependency `@azure/arm-appservice` to `^14.0.0`.
- Updated dependencies
  - @backstage/backend-common@0.20.0-next.0
  - @backstage/config@1.1.1
  - @backstage-community/plugin-azure-sites-common@0.1.1

## 0.1.17

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.9
  - @backstage/config@1.1.1
  - @backstage-community/plugin-azure-sites-common@0.1.1

## 0.1.17-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.9-next.2

## 0.1.17-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.9-next.1
  - @backstage/config@1.1.1
  - @backstage-community/plugin-azure-sites-common@0.1.1

## 0.1.17-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.9-next.0
  - @backstage/config@1.1.1
  - @backstage-community/plugin-azure-sites-common@0.1.1

## 0.1.16

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.8
  - @backstage/config@1.1.1
  - @backstage-community/plugin-azure-sites-common@0.1.1

## 0.1.16-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.8-next.2
  - @backstage/config@1.1.1-next.0
  - @backstage-community/plugin-azure-sites-common@0.1.1

## 0.1.15-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.7-next.1
  - @backstage/config@1.1.0
  - @backstage-community/plugin-azure-sites-common@0.1.1

## 0.1.15-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.7-next.0
  - @backstage/config@1.1.0
  - @backstage-community/plugin-azure-sites-common@0.1.1

## 0.1.13

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.5
  - @backstage/config@1.1.0
  - @backstage-community/plugin-azure-sites-common@0.1.1

## 0.1.13-next.3

### Patch Changes

- Updated dependencies
  - @backstage/config@1.1.0-next.2
  - @backstage-community/plugin-azure-sites-common@0.1.1-next.0
  - @backstage/backend-common@0.19.5-next.3

## 0.1.13-next.2

### Patch Changes

- Updated dependencies
  - @backstage/config@1.1.0-next.1
  - @backstage/backend-common@0.19.5-next.2
  - @backstage-community/plugin-azure-sites-common@0.1.0

## 0.1.13-next.1

### Patch Changes

- Updated dependencies
  - @backstage/config@1.1.0-next.0
  - @backstage/backend-common@0.19.5-next.1
  - @backstage-community/plugin-azure-sites-common@0.1.0

## 0.1.12-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.4-next.0
  - @backstage/config@1.0.8
  - @backstage-community/plugin-azure-sites-common@0.1.0

## 0.1.10

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.2
  - @backstage/config@1.0.8
  - @backstage-community/plugin-azure-sites-common@0.1.0

## 0.1.10-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.2-next.2

## 0.1.10-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.2-next.1
  - @backstage/config@1.0.8
  - @backstage-community/plugin-azure-sites-common@0.1.0

## 0.1.10-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.2-next.0
  - @backstage/config@1.0.8
  - @backstage-community/plugin-azure-sites-common@0.1.0

## 0.1.9

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.1
  - @backstage/config@1.0.8
  - @backstage-community/plugin-azure-sites-common@0.1.0

## 0.1.9-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.1-next.0
  - @backstage/config@1.0.8
  - @backstage-community/plugin-azure-sites-common@0.1.0

## 0.1.8

### Patch Changes

- b43e030911f2: Upgrade `@azure/identity` to support using Workload Identity to authenticate against Azure.
- Updated dependencies
  - @backstage/backend-common@0.19.0
  - @backstage/config@1.0.8
  - @backstage-community/plugin-azure-sites-common@0.1.0

## 0.1.8-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.0-next.2
  - @backstage/config@1.0.7
  - @backstage-community/plugin-azure-sites-common@0.1.0

## 0.1.8-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.19.0-next.1
  - @backstage/config@1.0.7
  - @backstage-community/plugin-azure-sites-common@0.1.0

## 0.1.8-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.6-next.0
  - @backstage/config@1.0.7
  - @backstage-community/plugin-azure-sites-common@0.1.0

## 0.1.7

### Patch Changes

- d66d4f916aa: Updated URL to `/health` and corrected typos in the `README.md`
- Updated dependencies
  - @backstage/backend-common@0.18.5
  - @backstage/config@1.0.7
  - @backstage-community/plugin-azure-sites-common@0.1.0

## 0.1.7-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.5-next.1
  - @backstage/config@1.0.7

## 0.1.7-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.5-next.0
  - @backstage/config@1.0.7
  - @backstage-community/plugin-azure-sites-common@0.1.0

## 0.1.6

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.4
  - @backstage/config@1.0.7
  - @backstage-community/plugin-azure-sites-common@0.1.0

## 0.1.6-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.4-next.2
  - @backstage/config@1.0.7
  - @backstage-community/plugin-azure-sites-common@0.1.0

## 0.1.6-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.4-next.1
  - @backstage/config@1.0.7
  - @backstage-community/plugin-azure-sites-common@0.1.0

## 0.1.6-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.4-next.0
  - @backstage/config@1.0.7
  - @backstage-community/plugin-azure-sites-common@0.1.0

## 0.1.5

### Patch Changes

- 52b0022dab7: Updated dependency `msw` to `^1.0.0`.
- Updated dependencies
  - @backstage/backend-common@0.18.3
  - @backstage/config@1.0.7
  - @backstage-community/plugin-azure-sites-common@0.1.0

## 0.1.5-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.3-next.2
  - @backstage/config@1.0.7-next.0

## 0.1.5-next.1

### Patch Changes

- 52b0022dab7: Updated dependency `msw` to `^1.0.0`.
- Updated dependencies
  - @backstage/backend-common@0.18.3-next.1
  - @backstage/config@1.0.7-next.0
  - @backstage-community/plugin-azure-sites-common@0.1.0

## 0.1.5-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.3-next.0
  - @backstage/config@1.0.6
  - @backstage-community/plugin-azure-sites-common@0.1.0

## 0.1.4

### Patch Changes

- c51efce2a0: Update docs to always use `yarn add --cwd` for app & backend
- Updated dependencies
  - @backstage/backend-common@0.18.2
  - @backstage/config@1.0.6
  - @backstage-community/plugin-azure-sites-common@0.1.0

## 0.1.4-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.2-next.2
  - @backstage/config@1.0.6
  - @backstage-community/plugin-azure-sites-common@0.1.0

## 0.1.4-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.2-next.1
  - @backstage/config@1.0.6
  - @backstage-community/plugin-azure-sites-common@0.1.0

## 0.1.4-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.2-next.0

## 0.1.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.0
  - @backstage/config@1.0.6
  - @backstage-community/plugin-azure-sites-common@0.1.0

## 0.1.2-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.0-next.1
  - @backstage/config@1.0.6-next.0
  - @backstage-community/plugin-azure-sites-common@0.1.0

## 0.1.2-next.0

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.18.0-next.0
  - @backstage/config@1.0.6-next.0
  - @backstage-community/plugin-azure-sites-common@0.1.0

## 0.1.1

### Patch Changes

- 3280711113: Updated dependency `msw` to `^0.49.0`.
- Updated dependencies
  - @backstage/backend-common@0.17.0
  - @backstage/config@1.0.5
  - @backstage-community/plugin-azure-sites-common@0.1.0

## 0.1.1-next.3

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.17.0-next.3
  - @backstage/config@1.0.5-next.1
  - @backstage-community/plugin-azure-sites-common@0.1.0

## 0.1.1-next.2

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.17.0-next.2
  - @backstage/config@1.0.5-next.1
  - @backstage-community/plugin-azure-sites-common@0.1.0

## 0.1.1-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.17.0-next.1
  - @backstage/config@1.0.5-next.1
  - @backstage-community/plugin-azure-sites-common@0.1.0

## 0.1.1-next.0

### Patch Changes

- 3280711113: Updated dependency `msw` to `^0.49.0`.
- Updated dependencies
  - @backstage/backend-common@0.16.1-next.0
  - @backstage/config@1.0.5-next.0
  - @backstage-community/plugin-azure-sites-common@0.1.0

## 0.1.0

### Minor Changes

- 4a75ce761c: Azure Sites (Apps & Functions) support for a given entity. View the current status of the site, quickly jump to site's Overview page, or Log Stream page.

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.16.0
  - @backstage-community/plugin-azure-sites-common@0.1.0
  - @backstage/config@1.0.4

## 0.1.0-next.1

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.16.0-next.1
  - @backstage/config@1.0.4-next.0
  - @backstage-community/plugin-azure-sites-common@0.1.0-next.0

## 0.1.0-next.0

### Minor Changes

- 4a75ce761c: Azure Sites (Apps & Functions) support for a given entity. View the current status of the site, quickly jump to site's Overview page, or Log Stream page.

### Patch Changes

- Updated dependencies
  - @backstage/backend-common@0.16.0-next.0
  - @backstage-community/plugin-azure-sites-common@0.1.0-next.0
  - @backstage/config@1.0.4-next.0
