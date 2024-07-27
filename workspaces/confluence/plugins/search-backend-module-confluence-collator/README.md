# Confluence Search Backend Module

This plugin provides the `ConfluenceCollatorFactory`, which can be used in the search backend to index Confluence space documents to your Backstage Search.

## Getting started

Before we begin, make sure:

- You have created your own standalone Backstage app using @backstage/create-app and not using a fork of the backstage repository. If you haven't setup Backstage already, start [here](https://backstage.io/docs/getting-started/).

To use any of the functionality this plugin provides, you need to start by configuring your App with the following config:

```yaml
confluence:
  baseUrl: http://confluence.example.com
  auth:
    type: bearer
    token: youApiToken
  spaces: []  # Warning, it is highly recommended to safely list the spaces that you want to index, either all documents will be indexed.
```

You may also want to add configuration parameters to your app-config, for example for controlling the scheduled indexing interval. These parameters should be placed under the `search.collators.confluence` key. See [the config definition file](./config.d.ts) for more details.

## Installation

Add the module package as dependency:

```bash
# From your Backstage root directory
yarn --cwd packages/backend add @backstage-community/plugin-search-backend-module-confluence-collator
```

### New Backend System

This backend plugin has support for the [new backend system](https://backstage.io/docs/backend-system/), here's how you can set that up:

In your `packages/backend/src/index.ts`, Add the collator to your backend instance, along with the search plugin itself:

```tsx
import { createBackend } from '@backstage/backend-defaults';

const backend = createBackend();
backend.add(import('@backstage/plugin-search-backend/alpha'));
backend.add(
  import('@backstage-community/plugin-search-backend-module-confluence-collator'),
);
backend.start();
```

### Legacy backend

#### Index Confluence Spaces to search

Before you are able to start index confluence spaces to search, you need to go through the [search getting started guide](https://backstage.io/docs/features/search/getting-started).

When you have your `packages/backend/src/plugins/search.ts` file ready to make modifications, add the following code snippet to add the `ConfluenceCollatorFactory`. Note that you can optionally modify the `spaces`, otherwise it will resolve and index **all** spaces authorized by the token.

```ts
indexBuilder.addCollator({
  schedule,
  factory: ConfluenceCollatorFactory.fromConfig(env.config, {
    logger: env.logger,
    requestParams: {
      tagged: ['backstage'],
      site: 'confluence',
      pagesize: 100,
    },
  }),
});
```

## Special thanks & Disclaimer

Thanks to K-Phoen for creating the grafana plugin found [here](https://github.com/K-Phoen/backstage-plugin-confluence). As an outcome 
of [this discussion](https://github.com/K-Phoen/backstage-plugin-confluence/issues/193), he gave us permission to keep working on this plugin.