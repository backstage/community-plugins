# @backstage-community/plugin-catalog-backend-module-mend-entity-processor

The mend-entity-processor backend module for the catalog plugin.

This module automatically adds Mend annotations to Component entities based on their source location, enabling integration with Mend security insights.

## Installation

```bash
yarn add @backstage-community/plugin-catalog-backend-module-mend-entity-processor
```

## Configuration

Add the module to your backend in `packages/backend/src/index.ts`:

```typescript
import { createBackend } from '@backstage/backend-defaults';

const backend = createBackend();

// ... other plugins

backend.add(
  import(
    '@backstage-community/plugin-catalog-backend-module-mend-entity-processor'
  ),
);

backend.start();
```

### App Config

Configure the Mend activation key in your `app-config.yaml` or`app-config.production.yaml`:

```yaml
mend:
  activationKey: ${MEND_ACTIVATION_KEY}
  cacheRefresh: 240
```

## How It Works

**Entity Processing**: When a Component entity is processed, the module:

- Extracts the source location from the entity's annotations
- Looks up matching Mend projects by repository URL from cache ( set cacheTTL based on the `cacheRefresh` configuration)
- Adds the `mend.io/project-ids` annotation with the matching project IDs

## Annotations Added

| Annotation            | Description                                                 |
| --------------------- | ----------------------------------------------------------- |
| `mend.io/project-ids` | String: Comma separated Mend project UUIDs linked to entity |

## Links

- [Frontend Mend Plugin Documentation](../mend/README.md)
- [Backend Mend Backend Documentation](../mend-backend/README.md)
