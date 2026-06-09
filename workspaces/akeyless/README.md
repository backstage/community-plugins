# Akeyless plugin for Backstage

The [Akeyless](https://www.akeyless.io) Backstage plugin lists secrets and other items under catalog-annotated paths. Phase 2 adds CRUD for **static secrets** in Backstage; other item types link to the Akeyless Console.

## Plugins

- [akeyless](./plugins/akeyless/README.md) — frontend entity card and Development tab
- [akeyless-backend](./plugins/akeyless-backend/README.md) — backend list-only API

## Developing

```sh
yarn install
export AKEYLESS_ACCESS_ID=...
export AKEYLESS_ACCESS_KEY=...
yarn start
```

Open a catalog entity with `akeyless.io/secrets-path` (see [examples/entities.yaml](./examples/entities.yaml)).

Standalone plugin development:

```sh
yarn workspace @backstage-community/plugin-akeyless start
yarn workspace @backstage-community/plugin-akeyless-backend start
```
