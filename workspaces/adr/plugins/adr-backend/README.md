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
