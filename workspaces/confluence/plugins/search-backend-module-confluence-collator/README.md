# Confluence Search Backend Module

This plugin provides the `ConfluenceCollatorFactory`, which can be used in the search backend to index Confluence space documents to your Backstage Search.

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
  import(
    '@backstage-community/plugin-search-backend-module-confluence-collator'
  ),
);
backend.start();
```

### Legacy backend

#### Index Confluence Spaces to search

Before you are able to start index confluence spaces to search, you need to go through the [search getting started guide](https://backstage.io/docs/features/search/getting-started).

When you have your `packages/backend/src/plugins/search.ts` file ready to make modifications, add the following code snippet to add the `ConfluenceCollatorFactory`. Note that you can optionally modify
the `spaces` or [`query`](https://developer.atlassian.com/cloud/confluence/advanced-searching-using-cql), otherwise it will resolve and index **all** spaces and documents authorized by the token.

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

## Configuration

There is some configuration that needs to be setup to use this action, these are the base parameters:

```yaml
confluence:
  baseUrl: 'http://confluence.example.com'
  auth:
    type: 'bearer' # can also be 'basic' or 'userpass'
    token: '${CONFLUENCE_TOKEN}'
  spaces: [] # It is highly recommended to safely list the spaces that you want to index, otherwise all spaces will be indexed.
  query: '' # If your spaces contain documents you don't want to index, you can use a CQL query to more precisely select them. This is combined with the spaces parameter above.
```

Documentation about CQL can be found [here](https://developer.atlassian.com/server/confluence/advanced-searching-using-cql)

The sections below will go into more details about the Base URL and Auth Methods.

#### Base URL

The `baseUrl` for Confluence Cloud should include the product name which is `wiki` by default but can be something else if your Org has changed it. An example `baseUrl` for Confluence Cloud would look like this: `https://example.atlassian.net/wiki`

If you are using a self-hosted Confluence instance this does not apply to you. Your `baseUrl` would look something like this: `https://confluence.example.com`

#### Auth Methods

The default authorization method is `bearer` but `basic` and `userpass` are also supported. Here's how you would configure each of these:

For `bearer`:

```yaml
confluence:
  baseUrl: 'https://confluence.example.com'
  auth:
    type: 'bearer'
    token: '${CONFLUENCE_TOKEN}'
```

For `basic`:

```yaml
confluence:
  baseUrl: 'https://confluence.example.com'
  auth:
    type: 'basic'
    token: '${CONFLUENCE_TOKEN}'
    email: 'example@company.org'
```

For `userpass`

```yaml
confluence:
  baseUrl: 'https://confluence.example.com'
  auth:
    type: 'userpass'
    username: 'your-username'
    password: 'your-password'
```

**Note:** For `basic` and `bearer` authorization methods you will need an access token for authorization with `Read` permissions. You can create a Personal Access Token (PAT) [in Confluence](https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/). The value used should be the raw token as it will be encoded for you by the action.

#### Search Schedule

By default the Confluence documents indexing will run every two hours. Here's how to configure the schedule:

```yaml
search:
  collators:
    confluence:
      frequency:
        minutes: 45
      timeout:
        minutes: 3
      initialDelay:
        minutes: 3
```

## Special thanks & Disclaimer

Thanks to K-Phoen for creating the confluence plugin found [here](https://github.com/K-Phoen/backstage-plugin-confluence). As an outcome
of [this discussion](https://github.com/K-Phoen/backstage-plugin-confluence/issues/193), he gave us permission to keep working on this plugin.
