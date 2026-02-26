# @backstage-community/plugin-growthbook

View and manage GrowthBook feature flags directly in Backstage catalog entities.

## Features

- 🎯 Display feature flags with types and default values
- 🔍 Filter flags by GrowthBook project
- 📊 Alphabetical sorting
- 🔐 Secure backend proxy with management API
- 📄 Custom entity page layout (Overview, Docs, Feature Flags only)
- 🎨 JSON detail dialog for complex flag values

## Installation

```bash
yarn workspace app add @backstage-community/plugin-growthbook
```

## Setup

### 1. Register the API factory

In `packages/app/src/apis.ts`:

```typescript
import {
  growthbookFlagsApiRef,
  GrowthbookFlagsClient,
} from '@backstage-community/plugin-growthbook';

export const apis: AnyApiFactory[] = [
  // ... other APIs
  createApiFactory({
    api: growthbookFlagsApiRef,
    deps: { discoveryApi: discoveryApiRef, fetchApi: fetchApiRef },
    factory: ({ discoveryApi, fetchApi }) =>
      new GrowthbookFlagsClient({ discoveryApi, fetchApi }),
  }),
];
```

### 2. Add to Entity Page

In `packages/app/src/components/catalog/EntityPage.tsx`:

```typescript
import {
  GrowthbookEntityPage,
  isGrowthbookAvailable,
} from '@backstage-community/plugin-growthbook';

// In your componentPage:
const componentPage = (
  <EntitySwitch>
    <EntitySwitch.Case if={isGrowthbookAvailable}>
      <GrowthbookEntityPage />
    </EntitySwitch.Case>
    {/* ... other cases */}
  </EntitySwitch>
);
```

### 3. Configure in `app-config.yaml`

```yaml
growthbook:
  baseUrl: ${GROWTHBOOK_BASE_URL}
  secretKey: ${GROWTHBOOK_SECRET_KEY} # For management API (project filtering)
  sdkKeys:
    prod: ${GROWTHBOOK_SDK_KEY_PROD}
    dev: ${GROWTHBOOK_SDK_KEY_DEV}
```

### 4. Annotate entities in `catalog-info.yaml`

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: my-service
  annotations:
    growthbook.io/enabled: 'true'
    growthbook.io/env: 'prod'
    growthbook.io/project: 'my-project' # Optional: filter to specific project
spec:
  type: service
  owner: team-a
```

## Annotations

| Annotation              | Required | Description                                  |
| ----------------------- | -------- | -------------------------------------------- |
| `growthbook.io/enabled` | Yes      | Set to `"true"` to enable the GrowthBook tab |
| `growthbook.io/env`     | No       | Environment (default: `prod`)                |
| `growthbook.io/project` | No       | GrowthBook project name to filter flags      |

## Configuration

The plugin requires the backend plugin (`@backstage-community/plugin-growthbook-backend`) to be installed and configured.

## Screenshots

![GrowthBook Feature Flags Tab](./docs/screenshot.png)

## License

Apache-2.0

## Author

Zaki Hanafiah <zaki@zakhov.com>
