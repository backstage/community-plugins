# Checkmarx Frontend Plugin

This plugin renders Checkmarx data inside Backstage catalog entities.

## Features

- `EntityCheckmarxCard` for the entity overview
- `EntityCheckmarxContentPage` for the `/checkmarx` tab
- `CheckmarxRelatedEntitiesOverview` for system-level rollups

## Catalog Annotations

```yaml
metadata:
  annotations:
    checkmarx.org/project-id: 1491e6f9-0411-4b88-8271-d93d120d05df
    checkmarx.org/default-branch: main # optional
```

If `checkmarx.org/default-branch` is missing, the backend falls back to
searching completed scans in `main` and then `master`.

## Legacy Frontend System

```tsx
import {
  EntityCheckmarxCard,
  EntityCheckmarxContentPage,
  CheckmarxRelatedEntitiesOverview,
} from '@backstage-community/plugin-checkmarx';
```

Available exports:

- `checkmarxApiRef`
- `EntityCheckmarxCard`
- `EntityCheckmarxContentPage`
- `CheckmarxRelatedEntitiesOverview`

## New Frontend System

```tsx
import checkmarxPlugin from '@backstage-community/plugin-checkmarx/alpha';

const app = createApp({
  features: [checkmarxPlugin],
});
```

Extensions exposed by the plugin:

- `api:checkmarx/checkmarx-api`
- `entity:checkmarx/entity-checkmarx-card`
- `entity:checkmarx/checkmarx-related-entities-overview`

## Links

- [Backend plugin](../checkmarx-backend/README.md)
