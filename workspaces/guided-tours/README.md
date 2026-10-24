# Guided Tours plugin for Backstage

This workspace contains the guided tours plugins for Backstage: spotlight
steps on top of any page, per-user progress and automatic start on login or
on the first visit of a path. They target the new frontend system.

## Plugins

- [plugin-guided-tours](./plugins/guided-tours/README.md): the tour runner,
  the overlay and the overview page at `/guided-tours`.
- [plugin-guided-tours-react](./plugins/guided-tours-react/README.md): the
  blueprint, API ref and hooks that let any frontend plugin ship a tour.

## Getting Started

To start the dev app, run:

```sh
yarn install
yarn start
```

It opens a portal-like demo at http://localhost:3000 with a welcome tour and
page tours for the catalog, templates, notifications and settings.

## Tests

```sh
yarn test            # unit tests
yarn test:e2e        # Playwright tests against the dev app
```

To generate the API and knip reports for this workspace, run:

```sh
yarn build:api-reports
yarn build:knip-reports
```
