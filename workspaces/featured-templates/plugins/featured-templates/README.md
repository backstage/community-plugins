# featured-templates

The frontend for the Featured Templates plugin, providing a home page widget that showcases Software Templates containing a configurable tag (default: `featured`) on the Backstage home page.

## Prerequisites

- [Home plugin](https://github.com/backstage/backstage/tree/master/plugins/home)

## Installation

If you're using [feature discovery](https://backstage.io/docs/frontend-system/architecture/app/#feature-discovery), the plugin should be automatically discovered and enabled. Otherwise, you can manually enable the plugin by adding it to your app:

```tsx
// packages/app/src/App.tsx
import featuredTemplatesPlugin from '@backstage-community/plugin-featured-templates';

const app = createApp({
  features: [
    // ...
    featuredTemplatesPlugin,
  ],
});
```

## Customization

The widget defaults to the title `Featured Templates` and tag `featured`, but either values can be overridden in `app-config.yaml`:

```yaml
app:
  extensions:
    - home-page-widget:featured-templates:
        config:
          title: Golden Paths
          tag: golden-path
```

## Local development

You can also serve the plugin in isolation by running `yarn start` in the plugin directory.
This method of serving the plugin provides quicker iteration speed and a faster startup and hot reloads.
It is only meant for local development, and the setup for it can be found inside the [/dev](./dev) directory.
