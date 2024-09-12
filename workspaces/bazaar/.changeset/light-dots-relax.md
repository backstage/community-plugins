---
'@backstage-community/plugin-bazaar-backend': minor
---

**BREAKING**: The `discovery` service is now required if using the old backend
system. Migrated to support new auth services.

```diff
import { PluginEnvironment } from '../types';
import { createRouter } from '@backstage-community/plugin-bazaar-backend';
import { Router } from 'express';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  return await createRouter({
    logger: env.logger,
    config: env.config,
    database: env.database,
+   discovery: env.discovery,
    identity: env.identity,
  });
}
```
