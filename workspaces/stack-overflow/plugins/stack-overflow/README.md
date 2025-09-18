# Stack Overflow

A [Backstage](https://backstage.io/) plugin that integrates Stack Overflow content into your Backstage app. Use it to surface relevant Stack Overflow questions and answers in search results or display them on your homepage.

> Note: For Stack Overflow specific search results to be returned, it needs to be indexed. Use the [Stack Overflow Search Backend Module](https://github.com/backstage/backstage/blob/master/plugins/search-backend-module-stack-overflow-collator/README.md) to index Stack Overflow Questions to search.

## Installation

To install the Stack Overflow plugin in your Backstage app, run the following command in your app's root directory:

```sh
yarn --cwd packages/app add @backstage/plugin-stack-overflow
```

After installing, follow the configuration steps below to get started.

To use any of the functionality this plugin provides, you need to start by configuring your App with the following config:

```yaml
stackoverflow:
  baseUrl: https://api.stackexchange.com/2.2 # alternative: your internal stack overflow instance
```

### New Frontend System

If you have [Feature Discovery](https://backstage.io/docs/frontend-system/architecture/app#feature-discovery) enabled, no additional configuration is required. Otherwise, you should be able to enable the plugin in your `packages/app/src/App.tsx`:

```diff
+ import stackOverflowPlugin from '@backstage-community/plugin-stack-overflow';

  ...

  export const app = createApp({
    features: [
      catalogPlugin,
      catalogImportPlugin,
      userSettingsPlugin,
+     stackOverflowPlugin,
    // ...
    ],
  });
```

That's it!

### Legacy Frontend System

When you have your `packages/app/src/components/search/SearchPage.tsx` file ready to make modifications, add the following code snippet to add the `StackOverflowSearchResultListItem` when the type of the search results are `stack-overflow`.

```tsx
 case 'stack-overflow':
  return (
    <StackOverflowSearchResultListItem
      key={document.location}
      result={document}
    />
  );
```

## Use Stack Overflow Questions on your homepage

Before you are able to add the stack overflow question component to your homepage, you need to go through the [homepage getting started guide](https://backstage.io/docs/getting-started/homepage). When its ready, add the following code snippet to your `packages/app/src/components/home/HomePage.tsx` file.

```tsx
<Grid item xs={12} md={6}>
  <HomePageStackOverflowQuestions
    requestParams={{
      tagged: 'backstage',
      site: 'stackoverflow',
      pagesize: 5,
    }}
  />
</Grid>
```

**Note**: This is currently unavailable in the new frontend system.
