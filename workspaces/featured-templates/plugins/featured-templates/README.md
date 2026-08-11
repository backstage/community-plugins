# featured-templates

The frontend for the Featured Templates plugin, a New Frontend System home page widget for promoting Software Templates selected by one catalog tag.

## Features

This plugin provides:

- a home page widget that showcases every Software Template carrying a configurable catalog tag
- scrollable template cards that navigate to the scaffolder form on selection
- loading, error, and empty states, with a retry action and a link to browse all templates
- translatable messages via the Backstage translation API

## Installation

Install the plugin in your Backstage app:

```sh
yarn --cwd packages/app add @backstage-community/plugin-featured-templates
```

Apps using frontend feature discovery load its root default export automatically. Otherwise, add the default export to the `features` passed to `createApp`.

The app must also install the New Frontend System home and scaffolder plugins.

## Configuration

The widget defaults to the title `Featured Templates` and catalog tag `featured`:

```yaml
app:
  extensions:
    - home-page-widget:featured-templates
```

Override either value in `app-config.yaml`:

```yaml
app:
  extensions:
    - home-page-widget:featured-templates:
        config:
          title: Golden Paths
          tag: golden-path
```

`title` and `tag` must contain non-whitespace characters. The widget queries every visible `Template` carrying the configured tag and preserves catalog order.

## Translations

The widget's messages (scroll button labels, error and empty states) resolve through the Backstage translation API via the exported `featuredTemplatesTranslationRef`. Apps can override messages or add languages with `TranslationBlueprint`:

```ts
import { TranslationBlueprint } from '@backstage/plugin-app-react';
import { createTranslationMessages } from '@backstage/frontend-plugin-api';
import { featuredTemplatesTranslationRef } from '@backstage-community/plugin-featured-templates';

const featuredTemplatesTranslation = TranslationBlueprint.make({
  name: 'featured-templates-overrides',
  params: {
    resource: createTranslationMessages({
      ref: featuredTemplatesTranslationRef,
      messages: {
        emptyMessage: 'No featured templates yet.',
      },
    }),
  },
});
```

## Local development

Run `yarn start` from this package. The standalone New Frontend System app supplies an in-memory catalog with matching and non-matching templates; no Backstage backend is required to inspect filtering, overflow, scrolling, card sizing, or navigation.
