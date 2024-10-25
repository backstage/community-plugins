# tech-radar

Welcome to the tech-radar backend plugin!

This plugin is an optional accompaniment the the [tech-radar plugin](../tech-radar/README.md). It uses the [URL Reader service](https://backstage.io/docs/backend-system/core-services/url-reader/) to retrieve tech radar response data from a URL, which must be provided in the config. This means a definition file can be stored in GitHub, versioned, and potentially consumed by other systems along with Backstage (and as long as Github is present in the integrations section of `app-config.yaml`, urlReader will handle authentication). The file must contain [TechRadarLoaderResponse](../tech-radar-common/src/schema.ts) data in JSON format - can use [this sample](../tech-radar-common/src/sampleTechRadarResponse.json) as a reference.

If using this plugin, make a modification to `app-config.yaml` to describe the source JSON:

```yaml title="app-config.yaml"
techRadar:
  url: https://github.com/backstage/community-plugins/blob/main/workspaces/tech-radar/plugins/tech-radar-common/src/sampleTechRadarResponse.json
```

If you are storing the JSON file in a private repository, you will need to configure the proper integration in the `app-config.yaml` file. For more information on how to configure integrations, see the [Backstage documentation](https://backstage.io/docs/integrations/).

## Integrating into a backstage instance

This plugin needs to be added to an existing backstage instance.

```bash
# From your Backstage root directory
yarn --cwd packages/backend add @backstage-community/plugin-tech-radar-backend
```

## New Backend System

The Tech Radar backend plugin has support for the [new backend system](https://backstage.io/docs/backend-system/), here's how you can set that up:

In your `packages/backend/src/index.ts` make the following changes:

```diff
  import { createBackend } from '@backstage/backend-defaults';
  const backend = createBackend();
  // ... other feature additions
+ backend.add(import('@backstage-community/plugin-tech-radar-backend'));
  backend.start();
```

## Legacy Backend System

If still using the legacy backend, do the following:

Creating a `src/plugins/techRadar.ts` file and adding a reference to it to `src/index.ts` in the backend package.

### techRadar.ts

```typescript
import { createRouter } from '@backstage-community/plugin-tech-radar-backend';
import { Router } from 'express';
import { PluginEnvironment } from '../types';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  return await createRouter({
    logger: env.logger,
    config: env.config,
    reader: env.reader,
  });
}
```

### src/index.ts

```diff
@@ -50,6 +50,7 @@ import scaffolder from './plugins/scaffolder';
 import proxy from './plugins/proxy';
 import search from './plugins/search';
 import techdocs from './plugins/techdocs';
+import techRadar from './plugins/techRadar';
 import techInsights from './plugins/techInsights';
 import todo from './plugins/todo';
 import graphql from './plugins/graphql';
@@ -133,6 +134,7 @@ async function main() {
     createEnv('tech-insights'),
   );
   const permissionEnv = useHotMemoize(module, () => createEnv('permission'));
+  const techRadarEnv = useHotMemoize(module, () => createEnv('techRadar'));

   const apiRouter = Router();
   apiRouter.use('/catalog', await catalog(catalogEnv));
@@ -152,6 +154,7 @@ async function main() {
   apiRouter.use('/badges', await badges(badgesEnv));
   apiRouter.use('/jenkins', await jenkins(jenkinsEnv));
   apiRouter.use('/permission', await permission(permissionEnv));
+  apiRouter.use('/tech-radar', await techRadar(techRadarEnv));
   apiRouter.use(notFoundHandler());

   const service = createServiceBuilder(module)

```
