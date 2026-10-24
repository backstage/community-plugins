# @backstage-community/plugin-guided-tours

Guided tours for the Backstage new frontend system: spotlight steps with
markdown, per-user progress in user settings, auto-start on login or on the
first visit of a path, and an overview page at `/guided-tours`.

Install the package in `packages/app` (it is discovered through
`app.packages: all`) and add the page to your sidebar:

```tsx
{
  nav.take('page:guided-tours');
}
```

Ship tours from any plugin with `@backstage-community/plugin-guided-tours-react`,
see its README.

## Configuration

```yaml
app:
  extensions:
    - guided-tour:example/intro: false # disable a single tour
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
