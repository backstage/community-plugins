# @backstage-community/plugin-catalog-backend-module-apiiro-entity-processor

Catalog backend module that automatically adds Apiiro annotations to Backstage entities based on their `backstage.io/source-location`. It is used together with the Apiiro frontend and backend plugins to simplify onboarding and keep Apiiro-related annotations consistent.

## Overview

When enabled, this module:

- Derives the Apiiro repository identifier from the entity's source location.
- Adds the following annotations when they are missing:
  - `apiiro.com/repo-id`
  - `apiiro.com/allow-metrics-view`
- **Does not overwrite** existing Apiiro annotations if they are already set on the entity.

This helps you avoid manually managing Apiiro annotations on every entity in your catalog.

## Installation

From your Backstage root directory, install the module in the backend:

```bash
yarn --cwd packages/backend add @backstage-community/plugin-catalog-backend-module-apiiro-entity-processor
```

## Usage

### 1. Register the entity processor

In `packages/backend/src/index.ts`, register the module with the backend:

```ts
backend.add(
  import(
    '@backstage-community/plugin-catalog-backend-module-apiiro-entity-processor'
  ),
);
```

After the catalog processing interval elapses, entities that have a valid `backstage.io/source-location`
will be updated with Apiiro annotations when they are missing.

### 2. Apiiro annotations

The processor works with the following annotations:

- `apiiro.com/repo-id`: `<repo-key>`
- `apiiro.com/allow-metrics-view`: `"true"` or `"false"` (controls whether the Metrics view appears in the Apiiro Tab and Apiiro Widget)

### Notes

- Annotation values are derived from the value of `backstage.io/source-location`. If `backstage.io/source-location` is not present, Apiiro annotations will not be added.
- If Apiiro annotations already exist on an entity, they take precedence and will **not** be overwritten.

## Permissions and Metrics View

Together with the Apiiro backend plugin configuration, you can further restrict
which entities are allowed to show Apiiro metrics (tiles / dashboards) and
widgets. In `app-config.yaml` or `app-config.production.yaml`:

```yaml
apiiro:
  accessToken: ${APIIRO_TOKEN}
  defaultAllowMetricsView: true
  # Optional configuration to allow or disallow metric views for specific entities
  permissionControl:
    entityNames:
      - component:<namespace>/<entity-name>
    exclude: true
```

Where the parameters in the `permissionControl`:

- `entityNames` is a list of entity references to control the metrics view access.
- `exclude: true` → **blocklist mode** (allow all entities except those listed).
- `exclude: false` → **allowlist mode** (deny all entities except those listed).

The `apiiro.com/allow-metrics-view` annotation and the above configuration
together determine whether a given entity can display metrics on Apiiro Tab and Apiiro Widget.
If you configure this list it will override the `defaultAllowMetricsView` configuration.

## Development

This module is developed as part of the Apiiro Backstage integration.
See the root repository `README.md` and the Apiiro backend plugin README for
more details on local development and configuration.
