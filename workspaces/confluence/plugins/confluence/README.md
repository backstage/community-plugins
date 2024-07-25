# Confluence

A plugin that provide Confluence specific functionality that can be used in different ways (e.g. for homepage and search) to compose your Backstage App.

# Getting Started

Before we begin make sure:

* You have created your own standalone Backstage app using @backstage/create-app and not using a fork of the bastage repository. if you haven't setup Backstage already, start [here](https://backstage.io/docs/getting-started/).

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

This confluence frontend plugin is primarily responsible for the following:

- Exposing Confluence related component `<ConfluenceSearchResultListItem />` which can be used for composing the search page.

#### Use specific search result list itm for Confluence

> Note: For Confluence specific search results to be returned, it needs to be indexed. Use the [search-backend-module-confluence-collator](../search-backend-module-confluence-collator/README.md) to index Confluence documents to search.

When you have you `packages/app/src/components/search/SearchPage.tsx` file ready to make modifications, add the following code snippet to add the `ConfluenceSearchResultListItem` web the type of search results are `confluence`.

```tsx
import {
  ConfluenceSearchResultListItem,
  ConfluenceSearchIcon } from '@backstage-community/plugin-confluence';
...
            <SearchType.Accordion
              name="Result Type"
              defaultValue="software-catalog"
              types={[
...
                {
                  value: 'confluence',
                  name: 'Confluence',
                  icon: <ConfluenceSearchIcon />,
                },
              ]}
            />
...
            <SearchResult>
...
              <ConfluenceSearchResultListItem icon={<ConfluenceSearchIcon />} />
            </SearchResult>
```

## Special thanks & Disclaimer

Thanks to K-Phoen for creating the grafana plugin found [here](https://github.com/K-Phoen/backstage-plugin-confluence). As an outcome
of [this discussion](https://github.com/K-Phoen/backstage-plugin-confluence/issues/193), he gave us permission to keep working on this plugin.
