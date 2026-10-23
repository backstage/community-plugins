# @internal/backstage-plugin-guided-tour

Guided tours for the Backstage new frontend system: spotlight steps with
markdown, per-user progress in user settings, auto-start on login or on the
first visit of a route, and an overview page at `/guided-tours`.

Install the package in `packages/app` (it is discovered through
`app.packages: all`) and add the page to your sidebar:

```tsx
{
  nav.take('page:guided-tour');
}
```

Ship tours from any plugin with `@internal/backstage-plugin-guided-tour-react`,
see its README.

## Configuration

```yaml
app:
  extensions:
    - guided-tour:example/intro: false # disable a single tour
    - api:guided-tour:
        config:
          autoStart: false # never start tours on their own
```

## Extensions

| Extension                              | Purpose                                             |
| -------------------------------------- | --------------------------------------------------- |
| `api:guided-tour`                      | Registry (`tours` input), runner and progress store |
| `app-root-element:guided-tour/overlay` | Spotlight and step card                             |
| `page:guided-tour`                     | Overview page at `/guided-tours`                    |

Progress is stored in the `guided-tour` bucket of the `storageApi`, one key
per tour plus an `onboarded` flag.
