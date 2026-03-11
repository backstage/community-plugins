# Github Discussions Plugin

Welcome to the Github Discussions plugin!

This plugin allows you to search through Github discussions and integrate the results into your Backstage instance.

## Prerequisites

Before using this plugin, you will need to install and configure the [Github Discussions Search Collator](../search-backend-module-github-discussions/README.md). The plugin's components are designed to render search results that are of document type `github-discussions`. Without the collator in place, no search results will be available for the plugin's components to display.

## Setup

1. Install this plugin:

```bash
# From your Backstage root directory
yarn --cwd packages/app add @backstage-community/plugin-github-discussions
```

2. Add `GithubDiscussionsSearchResultListItem` to your search page:

```diff
# packages/app/src/components/search/SearchPage.tsx
+ import {
+   GithubDiscussionsSearchResultListItem,
+ } from '@backstage-community/plugin-github-discussions';
import { SearchResult } from '@backstage/plugin-search-react';

...

const SearchPage = () => {
  ...
  return (
    <Page>
      <Header />
      <Content>
        ...
        <Grid>
          <SearchResult>
+             <GithubDiscussionsSearchResultListItem />
          </SearchResult>
        </Grid>
      </Content>
    </Page>
  )
}
```

## New Frontend System (Alpha)

The GitHub Discussions plugin currently support the New Frontend System via an `/alpha` export, here's how to use it:

### Use new frontend system

1. Install the frontend plugin:

   ```bash
   # From your Backstage root directory
   yarn --cwd packages/app add @backstage-community/plugin-github-discussions
   ```

2. Enable the plugin in your `packages/app(-next)/src/App.tsx`:

   After all other imports:

   ```tsx
   import githubDiscussionsPlugin from '@backstage-community/plugin-github-discussions';
   ```

   ```tsx
   export const app = createApp({
     features: [
       catalogPlugin,
       catalogImportPlugin,
       userSettingsPlugin,
       githubDiscussionsPlugin,
       // ...
     ],
   });
   ```

   Alternatively you can simply use feature discover and skip the above step by adding the following yo your `app-config.yaml` file:

   ```yaml
   app:
     packages: all
   ```
