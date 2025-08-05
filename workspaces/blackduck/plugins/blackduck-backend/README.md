# blackduck

Welcome to the blackduck backend plugin!

## Installation

This plugin needs to be added to an existing backstage instance.

```bash
# From your Backstage root directory
yarn --cwd packages/backend add @backstage-community/plugin-blackduck-backend
```

### New Backend System

This backend plugin has support for the [new backend system](https://backstage.io/docs/backend-system/), here's how you can set that up:

In your `packages/backend/src/index.ts` make the following changes:

```diff
import { createBackend } from '@backstage/backend-defaults';

const backend = createBackend();

// ... other feature additions

+backend.add(import('@backstage-community/plugin-blackduck-backend'));

// ...

backend.start();
```

## Configuration

### Integrate Permission Framework

BlackDuck plugin supports permission framework.

```bash
# From your Backstage root directory
yarn --cwd packages/backend add @backstage-community/plugin-blackduck-common
```

In your `packages/backend/src/index.ts` make the following changes:

```diff
import { createBackend } from '@backstage/backend-defaults';
const backend = createBackend();
// ... other feature additions
+backend.add(import('@backstage-community/plugin-blackduck-common'));
// ...
```

### Configure Permission

To apply the permission rules add the following in `packages/backend/src/plugins/permissions.ts`

```diff
...
+ import {
+  blackduckRiskProfileReadPermission
+  blackduckVulnerabilitiesReadPermission } from '@backstage-community/plugin-blackduck-common';
...
async handle(
  request: PolicyQuery,
  user?: BackstageIdentityResponse,
): Promise<PolicyDecision> {
+ if ( isPermission(request.permission, blackduckRiskProfileReadPermission) ||
+      isPermission(request.permission, blackduckVulnerabilitiesReadPermission)) {
+    return createCatalogConditionalDecision(
+      request.permission,
+      catalogConditions.isEntityOwner({
+          claims: user?.identity.ownershipEntityRefs ?? [],
+       }),
+    );
+  }
...
  return {
    result: AuthorizeResult.ALLOW,
  };
}
```

## Continue with Frontend Plugin

Follow the Docs from [README.md](https://github.com/backstage/community-plugins/blob/main/workspaces/blackduck/plugins/blackduck/README.md)

### Global Config

Add the following into your `app-config.yaml`. The default host is mandatory - if no host specified in annotation, this host will be used. Other hosts are optional.

```yaml
blackduck:
  default: one
  hosts:
    - name: one
      host: https://blackduck.yourcompany.one.com/api
      token: YOUR_API_TOKEN_ONE
    - name: two
      host: https://blackduck.yourcompany.two.com/api
      token: YOUR_API_TOKEN_TWO
```

### Catalog

Add the following into your catalog. The host part is optional - if no host specified in annotation, the default one will be used.

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: backstage
  annotations:
    blackduck/project: YOUR_PROJECT_HOST_NAME/YOUR_PROJECT_NAME/YOUR_PROJECT_VERSION
```
