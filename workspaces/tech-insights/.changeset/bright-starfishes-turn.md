---
'@backstage-community/plugin-tech-insights-node': patch
---

Adds a new techInsightsServiceRef that provides a default tech insights client.

Users can now use the `techInsightsServiceRef` to get a default tech insights client as follows:

```typescript
import { techInsightsServiceRef } from '@backstage-community/plugin-tech-insights-node';

export const examplePlugin = createBackendPlugin({
  pluginId: 'example',
  register(env) {
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        httpRouter: coreServices.httpRouter,
        ..., // other dependencies
        techInsights: techInsightsServiceRef,
      },
      async init({
        logger,
        httpRouter,
        techInsights,
      }) {
        httpRouter.use(
          await createRouter({
            logger,
            techInsights,
          }),
        );
      },
    });
  },
});
```
