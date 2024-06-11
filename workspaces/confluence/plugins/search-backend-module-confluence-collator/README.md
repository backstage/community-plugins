# Confluence Search Backend Module

A plugin that provides confluence specific functionality that can be used in different ways (e.g. for search) to compose your Backstage App.

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

## Areas of Responsibility

This confluence backend plugin is primarily responsible for the following:

- Provides a `ConfluenceCollatorFactory`, which can be used in the search backend to index confluence space documents to your Backstage Search

### Index Confluence Spaces to search

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

## New Backend System

This package exports a module that extends the search backend to also indexing the questions exposed by the [`Confluence` API](https://developer.atlassian.com/cloud/confluence/rest/v1).

### Installation

Add the module package as a dependency:

```bash
# From your Backstage root directory
yarn --cwd packages/backend add @backstage-community/plugin-search-backend-module-confluence-collator
```

Add the collator to your backend instance, along with the search plugin itself:

```tsx
// packages/backend/src/index.ts
import { createBackend } from '@backstage/backend-defaults';

const backend = createBackend();
backend.add(import('@backstage/plugin-search-backend/alpha'));
backend.add(
  import('@backstage-community/plugin-search-backend-module-confluence-collator'),
);
backend.start();
```

You may also want to add configuration parameters to your app-config, for example for controlling the scheduled indexing interval. These parameters should be placed under the `search.collators.confluence` key. See [the config definition file](./config.d.ts) for more details.
