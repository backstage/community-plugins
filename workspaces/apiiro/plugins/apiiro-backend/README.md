# Apiiro Backend Plugin for Backstage

The Apiiro backend plugin provides the server-side functionality for the Apiiro Backstage integration. This plugin is **required** for the frontend plugin to function and handles API communication with the Apiiro platform, data retrieval, and permission management.

## Features

- **API Integration**: Communicates with Apiiro platform to retrieve security metrics and risk data
- **Permission Management**: Supports conditional permissions for entity-level access control

## Prerequisites

- Backstage instance (v1.40.x or higher)
- Apiiro Access Token with at least read permissions
- Frontend plugin `@backstage-community/plugin-apiiro` installed

### Installation

From your Backstage root directory, install the Apiiro backend plugin:

```bash
yarn --cwd packages/backend add @backstage-community/plugin-apiiro-backend
```

Then register the Apiiro backend plugin in `packages/backend/src/index.ts`:

```ts
backend.add(import('@backstage-community/plugin-apiiro-backend'));
```

## Automatically Adding Apiiro Annotations (Optional)

### Apiiro annotations

- `apiiro.com/repo-id`: `<repo-key>`
- `apiiro.com/allow-metrics-view`: "true" or "false" (controls whether the Metrics view appears in the Apiiro tab and Apiiro widget)

### Notes

- Annotation values are derived from the value of `backstage.io/source-location`.
- If Apiiro annotations already exist on an entity, they take precedence and will not be overwritten.
- If `backstage.io/source-location` is not present, Apiiro annotations will not be added.

### Step 1: Install the entity processor module

Install the Apiiro entity processor module in your backend:

```bash
yarn --cwd packages/backend add @backstage-community/plugin-catalog-backend-module-apiiro-entity-processor
```

### Step 2: Register the entity processor

Register the Apiiro entity processor in `packages/backend/src/index.ts`:

```ts
backend.add(
  import(
    '@backstage-community/plugin-catalog-backend-module-apiiro-entity-processor'
  ),
);
```

### Step 3: Configure entity-level Apiiro metric view restrictions (Optional)

Optionally, define a list of entities that should have restricted access to Apiiro metrics in your `app-config.yaml` or `app-config.production.yaml`:

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

**Configuration options:**

- **entityNames**:
  - A list of entity references to control access
  - Supports entity references in the format: `component:<namespace>/<entity-name>`
- **exclude**:
  - `true` (blocklist mode): Allow all entities except those listed in `entityNames`.
  - `false` (allowlist mode): Deny all entities except those listed in `entityNames`.

After the catalog processing interval elapses, the Apiiro annotations will be added or updated on the corresponding Backstage entities.

## Development

This plugin backend can be started in a standalone mode from directly in this package with `yarn start`. This is a limited setup that is most convenient when developing the plugin backend itself.

To run the entire project including the frontend, run `yarn start` from the workspace root directory.

## Links

- [Frontend Plugin Documentation](../apiiro/README.md)
- [Common Package Documentation](../apiiro-common/README.md)
