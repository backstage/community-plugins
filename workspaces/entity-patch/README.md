# entity-patch

This workspace contains the `@backstage-community/plugin-entity-patch` frontend plugin, which lets users edit [Backstage catalog entities](https://backstage.io/docs/features/software-catalog/) through structured, schema-driven forms — either from a context menu dialog or a dedicated page.

## Plugins

- \[plugin-backend](./plugins/plugin-backend/README):  Backend plugin that provides... WIP
- [`@backstage-community/plugin-entity-patch`](./plugins/entity-patch/README.md): Frontend plugin that adds an **Edit Patch** context menu item and a standalone patch page to catalog entities.

## Getting Started

To start the app, run:

```sh
yarn install
yarn start
```

The dev app starts at `http://localhost:3010` with a mock catalog entity. Open the context menu on any entity card and click **Edit Patch**, or navigate directly to `/entity-patch/:namespace/:kind/:name`. 


To generate knip reports for this app, run:

```sh
yarn backstage-repo-tools knip-reports
```
