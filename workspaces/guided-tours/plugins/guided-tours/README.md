# Guided Tours for Backstage

Guided tours for the Backstage new frontend system: spotlight steps with
markdown, per-user progress in user settings, auto-start on login or on the
first visit of a path, and an overview page at `/guided-tours`.

## Screenshots

|                              | Light                                                                                                                                                       | Dark                                                                                                                                                      |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Welcome step, centered       | ![Welcome step, centered (light)](https://raw.githubusercontent.com/backstage/community-plugins/main/workspaces/guided-tours/docs/welcome-light.png)        | ![Welcome step, centered (dark)](https://raw.githubusercontent.com/backstage/community-plugins/main/workspaces/guided-tours/docs/welcome-dark.png)        |
| Anchored step with spotlight | ![Anchored step with spotlight (light)](https://raw.githubusercontent.com/backstage/community-plugins/main/workspaces/guided-tours/docs/anchored-light.png) | ![Anchored step with spotlight (dark)](https://raw.githubusercontent.com/backstage/community-plugins/main/workspaces/guided-tours/docs/anchored-dark.png) |
| Catalog tour, last step      | ![Catalog tour, last step (light)](https://raw.githubusercontent.com/backstage/community-plugins/main/workspaces/guided-tours/docs/catalog-light.png)       | ![Catalog tour, last step (dark)](https://raw.githubusercontent.com/backstage/community-plugins/main/workspaces/guided-tours/docs/catalog-dark.png)       |
| Guided tours overview page   | ![Guided tours overview page (light)](https://raw.githubusercontent.com/backstage/community-plugins/main/workspaces/guided-tours/docs/page-light.png)       | ![Guided tours overview page (dark)](https://raw.githubusercontent.com/backstage/community-plugins/main/workspaces/guided-tours/docs/page-dark.png)       |

## Installation

```sh
yarn --cwd packages/app add @backstage-community/plugin-guided-tours
```

The plugin is discovered through `app.packages: all`.

Ship tours from any plugin with
[`@backstage-community/plugin-guided-tours-react`](https://github.com/backstage/community-plugins/tree/main/workspaces/guided-tours/plugins/guided-tours-react#readme).
The [tours of the dev app](https://github.com/backstage/community-plugins/tree/main/workspaces/guided-tours/plugins/guided-tours/dev/tours) are complete
examples: a welcome tour that starts on login, page tours that start on the
first visit of the catalog, templates, notifications and settings pages, and
a translated tour with lazily loaded content.

## Configuration

```yaml
app:
  extensions:
    - guided-tour:example/intro: false # disable the tour "intro" of the plugin "example"
    - api:guided-tours:
        config:
          autoStart: false # never start tours on their own
```

## Translations

The plugin ships German, Spanish, French, Italian and Japanese translations.
Register them in your app and offer the languages in the user settings:

```ts
import { guidedToursTranslationsModule } from '@backstage-community/plugin-guided-tours/alpha';

createApp({ features: [guidedToursTranslationsModule] });
```

```yaml
app:
  extensions:
    - api:app/app-language:
        config:
          availableLanguages: ['en', 'de', 'es', 'fr', 'it', 'ja']
```

## Extensions

| Extension                               | Purpose                                             |
| --------------------------------------- | --------------------------------------------------- |
| `api:guided-tours`                      | Registry (`tours` input), runner and progress store |
| `app-root-element:guided-tours/overlay` | Spotlight and step card                             |
| `page:guided-tours`                     | Overview page at `/guided-tours`                    |

Progress is stored in the `guided-tours` bucket of the `storageApi`, one key
per tour plus an `onboarded` flag.
