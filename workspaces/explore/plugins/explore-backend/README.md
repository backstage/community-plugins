# explore-backend

The `explore-backend` plugin provides a backend service for the Explore plugin.
This allows your organizations tools to be surfaced in the Explore plugin
through an API. It also provides a search collator to make it possible to search
for these tools.

## Getting started

### Adding the plugin to your `packages/backend`

Install dependencies

```bash
# From your Backstage root directory
yarn --cwd packages/backend add @backstage-community/plugin-explore-backend
```

Add feature

```ts title="packages/backend/src/index.ts"
backend.add(import('@backstage-community/plugin-explore-backend'));
```

To integrate with the search plugin, you have to install
[the explore module for the search-backend](https://github.com/backstage/backstage/tree/master/plugins/search-backend-module-explore/README.md).

Config:

```yaml
explore:
  tools:
    - title: New Relic
      description: new relic plugin
      url: /newrelic
      image: https://i.imgur.com/L37ikrX.jpg
      tags:
        - newrelic
        - proxy
        - nerdGraph
```

### Wire up Search Indexing

To index explore tools you will need to register the search collator in the
`packages/backend/src/plugins/search.ts` file.

```diff
+import { ToolDocumentCollatorFactory } from '@backstage-community/plugin-explore-backend';

...

+ // collator gathers entities from explore.
+  indexBuilder.addCollator({
+    schedule,
+    factory: ToolDocumentCollatorFactory.fromConfig(env.config, {
+      discovery: env.discovery,
+      logger: env.logger,
+    }),
+  });

...
```

### Wire up the Frontend

See [the explore plugin README](../explore/README.md) for more information.

## Explore Tool Customization

The `explore-backend` uses the `ExploreToolProvider` interface to provide a list
of tools used in your organization and/or within your Backstage instance. This
can be customized to provide tools from any source. For example you could create
a `CustomExploreToolProvider` that queries an internal for tools in your
`packages/backend/src/plugins/explore.ts` file.

```ts
// packages/backend/src/modules/exploreToolProviderModule.ts

import { createBackendModule } from '@backstage/backend-plugin-api';
import { toolProviderExtensionPoint } from '@backstage-community/plugin-explore-node';
import { ExploreTool } from '@backstage-community/plugin-explore-common';
import { StaticExploreToolProvider } from '@backstage-community/plugin-explore-backend';

const exploreTools: ExploreTool[] = [
  {
    title: 'New Relic',
    description: 'new relic plugin',
    url: '/newrelic',
    image: 'https://i.imgur.com/L37ikrX.jpg',
    tags: ['newrelic', 'proxy', 'nerdGraph'],
  },
];

export default createBackendModule({
  pluginId: 'explore',
  moduleId: 'exploreModuleToolProvider',
  register(env) {
    env.registerInit({
      deps: {
        exploreToolProvider: toolProviderExtensionPoint,
      },
      async init({ exploreToolProvider }) {
        exploreToolProvider.setToolProvider(
          StaticExploreToolProvider.fromData(exploreTools),
        );
      },
    });
  },
});
```

```ts
// packages/backend/src/index.ts

import exploreToolProviderModule from './modules/exploreToolProviderModule';

backend.add(exploreToolProviderModule);
```
