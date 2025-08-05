# ADR Backend

This ADR backend plugin is primarily responsible for the following:

- Provides a `DefaultAdrCollatorFactory`, which can be used in the search backend to index ADR documents associated with entities to your Backstage Search.

- Provides endpoints that use UrlReaders for getting ADR documents (used in the [ADR frontend plugin](../adr/README.md)).

## Install

## Setup your `integrations` config

First off you'll need to setup your `integrations` config inside your `app-config.yaml`. You can skip this step if it's already setup previously, and if you need help configuring this you can read the [integrations documentation](https://backstage.io/docs/integrations/)

### Up and Running

Here's how to get the backend up and running:

1. First we need to add the `@backstage-community/plugin-adr-backend` package to your backend:

```sh
# From your Backstage root directory
yarn --cwd packages/backend add @backstage-community/plugin-adr-backend
```

2. Then we will create a new file named `packages/backend/src/plugins/adr.ts`, and add the
   following to it:

```ts
import { createRouter } from '@backstage-community/plugin-adr-backend';
import { Router } from 'express';
import { PluginEnvironment } from '../types';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  return await createRouter({
    reader: env.reader,
    cacheClient: env.cache.getClient(),
    logger: env.logger,
  });
}
```

3. Next we wire this into the overall backend router, edit `packages/backend/src/index.ts`:

```ts
import adr from './plugins/adr';
// ...
async function main() {
  // ...
  // Add this line under the other lines that follow the useHotMemoize pattern
  const adrEnv = useHotMemoize(module, () => createEnv('adr'));
  // ...
  // Insert this line under the other lines that add their routers to apiRouter in the same way
  apiRouter.use('/adr', await adr(adrEnv));
```

4. Now run `yarn start-backend` from the repo root

### New Backend System

The ADR backend plugin has support for the [new backend system](https://backstage.io/docs/backend-system/), here's how you can set that up:

In your `packages/backend/src/index.ts` make the following changes:

```diff
  const backend = createBackend();

+ backend.add(import('@backstage-community/plugin-adr-backend'));

// ... other feature additions

  backend.start();
```

## Indexing ADR documents for search

Refer to the [search-backend-module-adr](../search-backend-module-adr/README.md) documentation to integrate the search collator.

## Parsing custom ADR formats

By default, the plugin parses documents that follow the [MADR v3.0.0](https://github.com/adr/madr/tree/3.0.0)
and [MADR v2.x](https://github.com/adr/madr/tree/2.1.2) template formats. If you use a different ADR format, consider
writing a [module](https://backstage.io/docs/backend-system/architecture/modules) that extends this plugin and provides
a custom parser via
the [extension point](https://backstage.io/docs/backend-system/architecture/extension-points/) `adrExtensionPoint`. For
example, you can create a new module that provides a custom parser as follows:

```ts
import { createBackendModule } from '@backstage/backend-plugin-api';
import { adrExtensionPoint } from '@backstage-community/plugin-adr-backend';
import { createCustomAdrParser } from './parser';

export const adrModuleCustomAdrParser = createBackendModule({
  pluginId: 'adr',
  moduleId: 'custom-adr-parser',
  register(reg) {
    reg.registerInit({
      deps: {
        extensionPoint: adrExtensionPoint,
      },
      async init({ extensionPoint }) {
        extensionPoint.setAdrInfoParser(createCustomAdrParser());
      },
    });
  },
});
```

And in your `parser.ts`:

```ts
import { AdrInfoParser } from '@backstage-community/plugin-adr-common';

export const createCustomAdrParser = (): AdrInfoParser => {
  return (content: string, dateFormat?: string) => {
    // Your custom parsing logic here

    return {
      title: adrTitle,
      status: adrStatus,
      date: adrDate,
    };
  };
};
```
