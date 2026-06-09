# Confluence

This plugin provides the `<ConfluenceSearchResultListItem />` component for displaying Confluence search results in Backstage. To index Confluence documents into Backstage Search, use the [`@backstage-community/plugin-search-backend-module-confluence-collator`](https://github.com/backstage/community-plugins/tree/main/workspaces/confluence/plugins/search-backend-module-confluence-collator) backend module.

## Getting Started

Before we begin make sure:

- You have created your own standalone Backstage app using @backstage/create-app and not using a fork of the Backstage repository. If you haven't setup Backstage already, start [here](https://backstage.io/docs/getting-started/).
- You have set up the search collator backend module as described in the [`@backstage-community/plugin-search-backend-module-confluence-collator` README](https://github.com/backstage/community-plugins/tree/main/workspaces/confluence/plugins/search-backend-module-confluence-collator).

Add the plugin to your frontend app:

```bash
# From your Backstage root directory
yarn --cwd packages/app add @backstage-community/plugin-confluence
```

If you are using Backstage's [new frontend system](https://backstage.io/docs/frontend-system/), no extra step is required. If you are using the legacy frontend system, follow the [usage steps below](#legacy-frontend-system-usage).

### Legacy Frontend System Usage

Add the `ConfluenceSearchResultListItem` to your search page in `packages/app/src/components/search/SearchPage.tsx`:

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

Thanks to K-Phoen for creating the confluence plugin found [here](https://github.com/K-Phoen/backstage-plugin-confluence). As an outcome
of [this discussion](https://github.com/K-Phoen/backstage-plugin-confluence/issues/193), he gave us permission to keep working on this plugin.
