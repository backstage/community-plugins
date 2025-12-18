# CI/CD Statistics Plugin

This plugin shows charts of CI/CD pipeline durations over time. It expects to be used on the Software Catalog entity page, as it uses `useEntity` to figure out what component to get the build information for.

## Usage

> This plugin cannot be used as-is; it requires a custom implementation to fetch build information

To use this plugin, you need to implement an API `CicdStatisticsApi` and bind it to the `cicdStatisticsApiRef`. This API is defined in `src/apis/types.ts` and is an interface with two functions, `getConfiguration(options)` and `fetchBuilds(options)`. This plugin will call `getConfiguration` to allow the implementation to specify defaults and settings for the UI.

First time the UI shows, and each time the user changes filters and clicks `Update` to refresh the data, `fetchBuilds` is invoked with the filter options. The API implementation is the expected to fetch build information from somewhere, format it into a generic and rather simple type `Build` (also defined in `types.ts`). The API can optionally signal completion for a progress bar in the UI.

When this plugin has fetched the builds, it will transpose the list of builds (and build stages) into a tree of build stages. As build pipelines sometimes change, certain stages might end or begin within the date range of the view (when _Normalize time range_ is enabled, which is the default).

## New Frontend System

### Setup

If you're using [feature discovery](https://backstage.io/docs/frontend-system/architecture/app/#feature-discovery), the plugin should be automatically discovered and enabled. Otherwise, you can manually enable the plugin by adding it to your app:

```tsx
// packages/app/src/App.tsx
import cicdStatisticsPlugin from '@backstage-community/plugin-cicd-statistics/alpha';

const app = createApp({
  features: [
    // ...
    cicdStatisticsPlugin,
  ],
});
```

### Extensions

The following extensions are available in the plugin:

- `entity-content:cicd-statistics/entity`
