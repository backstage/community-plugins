# guided-tours

This workspace contains the guided tours plugins for Backstage: spotlight
steps on top of any page, per-user progress and automatic start on login or
on the first visit of a route. They target the new frontend system.

## Plugins

- [plugin-guided-tours](./plugins/guided-tours/README.md): the tour runner,
  the overlay and the overview page at `/guided-tours`.
- [plugin-guided-tours-react](./plugins/guided-tours-react/README.md): the
  blueprint, API ref and hooks that let any frontend plugin ship a tour.

## Getting Started

To start the dev app, run:

```sh
yarn install
yarn --cwd plugins/guided-tours start
```

To generate knip reports for this workspace, run:

```sh
yarn backstage-repo-tools knip-reports
```
