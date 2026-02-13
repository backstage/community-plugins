# Github Discussions Plugin

Welcome to the Github Discussions plugin!

This plugin allows you to search through Github discussions and integrate the results into your Backstage instance.

## Prerequisites

Before using this plugin, you will need to install and configure the [Github Discussions Search Collator](../search-backend-module-github-discussions/README.md). The plugin's components are designed to render search results that are of document type `github-discussions`. Without the collator in place, no search results will be availalbe for the plugin's components to display.

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
