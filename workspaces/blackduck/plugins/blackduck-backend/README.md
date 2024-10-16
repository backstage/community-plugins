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

### Legacy Backend System

Create a file called blackduck.ts inside `packages/backend/src/plugins/` and add the following:

### blackduck.ts

```typescript
import {
  createRouter,
  BlackDuckConfig,
} from '@backstage-community/plugin-blackduck-backend';
import { Router } from 'express';
import { PluginEnvironment } from '../types';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  return await createRouter({
    logger: env.logger,
    config: env.config,
    permissions: env.permissions,
    discovery: env.discovery,
    blackDuckConfig: BlackDuckConfig.fromConfig(env.config),
  });
}
```

And import the plugin to `packages/backend/src/index.ts`.

### src/index.ts

```diff
diff --git a/packages/backend/src/index.ts b/packages/backend/src/index.ts
index c4736a5..5822302 100644
--- a/packages/backend/src/index.ts
+++ b/packages/backend/src/index.ts
@@ -28,6 +28,7 @@ import scaffolder from './plugins/scaffolder';
 import proxy from './plugins/proxy';
 import techdocs from './plugins/techdocs';
 import search from './plugins/search';
+import blackduck from './plugins/blackduck';
 import { PluginEnvironment } from './types';
 import { ServerPermissionClient } from '@backstage/plugin-permission-node';
 import { DefaultIdentityClient } from '@backstage/plugin-auth-node';
@@ -85,6 +86,7 @@ async function main() {
   const techdocsEnv = useHotMemoize(module, () => createEnv('techdocs'));
   const searchEnv = useHotMemoize(module, () => createEnv('search'));
   const appEnv = useHotMemoize(module, () => createEnv('app'));
+  const blackduckEnv = useHotMemoize(module, () => createEnv('blackduck'));

   const apiRouter = Router();
   apiRouter.use('/catalog', await catalog(catalogEnv));
@@ -93,6 +95,7 @@ async function main() {
   apiRouter.use('/techdocs', await techdocs(techdocsEnv));
   apiRouter.use('/proxy', await proxy(proxyEnv));
   apiRouter.use('/search', await search(searchEnv));
+  apiRouter.use('/blackduck', await blackduck(blackduckEnv));

   // Add backends ABOVE this line; this 404 handler is the catch-all fallback
   apiRouter.use(notFoundHandler());

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
