# Mend.io - backend

The Mend backend plugin provides the server-side functionality for the Mend Backstage integration. This plugin is **required** for the frontend plugin to function and handles API communication with the Mend.io platform to retrieve project details and security findings with permission management.

## Prerequisites

- Mend Activation Key
- Frontend plugin `@backstage-community/plugin-mend` installed
- Catalog Backend Module Mend Entity Processor plugin `@backstage-community/plugin-catalog-backend-module-mend-entity-processor` installed to add the Mend annotations in entities.

## Installation

From your Backstage root directory, install the Mend backend plugins:

```bash
yarn --cwd packages/backend add @backstage-community/plugin-mend-backend @backstage-community/plugin-catalog-backend-module-mend-entity-processor
```

In your `packages/backend/src/index.ts` file:

```ts
backend.add(import('@backstage-community/plugin-mend-backend'));
backend.add(
  import(
    '@backstage-community/plugin-catalog-backend-module-mend-entity-processor'
  ),
);
```

## Mend.io Projects Cache Refresh (Optional)

The plugin using a cache mechanism to store the project detail from Mend for better performance on data retrieval.
By default the data will be refresh on every 240 minutes (4 hours).

use the following configuration to modify that refresh cycle:

```yaml
mend:
  activationKey: ${MEND_ACTIVATION_KEY}
  cacheRefresh: 240
```

## Mend.io Projects Control (Optional)

The plugin supports configuration-based permission control to filter which projects are visible to users.

### How It Works

- **Project Filtering**: Provide a list of project IDs in the configuration to filter projects
- **Control Modes**: Use the `exclude` property to control the filtering behavior:
  - `true` (blocklist mode): Show all projects **EXCEPT** those in the list
  - `false` (allowlist mode): Show **ONLY** projects in the list

### Configuration

Add the following configuration to your `app-config.yaml` or `app-config.production.yaml`:

```yaml
mend:
  activationKey: ${MEND_ACTIVATION_KEY}
  permissionControl:
    ids:
      - <project-uuid-1> # Project UUID to filter
      - <project-uuid-2> # Another project UUID
    exclude: true # Set to true for blocklist mode, false for allowlist mode
```

### Configuration Options

| Option    | Type    | Default | Description                                                 |
| --------- | ------- | ------- | ----------------------------------------------------------- |
| `ids`     | Array   | -       | Array of project UUIDs to include or exclude                |
| `exclude` | Boolean | `true`  | Filtering mode: `true` for blocklist, `false` for allowlist |

### Mode Examples

#### Blocklist Mode (exclude: true)

```yaml
permissionControl:
  ids:
    - project-123
    - project-456
  exclude: true
```

_Result: Show all projects **except** project-123 and project-456_

#### Allowlist Mode (exclude: false)

```yaml
permissionControl:
  ids:
    - project-789
    - project-101
  exclude: false
```

_Result: Show **only** project-789 and project-101_

## Links

- [Frontend Mend Plugin Documentation](../mend/README.md)
- [Catalog Backend Module Mend Entity Processor Documentation](../catalog-backend-module-mend-entity-processor/README.md)
