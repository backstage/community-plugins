# @backstage-community/plugin-growthbook

View and manage GrowthBook feature flags directly in Backstage catalog entities.

## Features

- 🎯 Display feature flags with types and default values
- 🔍 Filter flags by GrowthBook project
- 📊 Alphabetical sorting
- 🔐 Secure backend proxy with management API
- 🎨 JSON detail dialog for complex flag values

## Installation

> **Note:** Install and configure the backend plugin first — [`@backstage-community/plugin-growthbook-backend`](../growthbook-backend/README.md). It provides the API that this frontend plugin depends on.

```bash
yarn workspace app add @backstage-community/plugin-growthbook
```

## Setup

### New Frontend System

If you are on the new Backstage frontend system, import the plugin from the `/alpha` subpath and add it to your app:

```typescript
// packages/app/src/App.tsx
import growthbookPlugin from '@backstage-community/plugin-growthbook/alpha';

export const app = createApp({
  features: [
    // ...your other plugins
    growthbookPlugin,
  ],
});
```

The `entityGrowthbookFlagsContent` extension is included by default and will show up on any entity that has the `growthbook.io/enabled: 'true'` annotation.

### Legacy Frontend System

#### 1. Add to Entity Page

In `packages/app/src/components/catalog/EntityPage.tsx`:

```typescript
import {
  EntityGrowthbookFlagsContent,
  isGrowthbookAvailable,
} from '@backstage-community/plugin-growthbook';

// Add a Feature Flags tab to your existing entity page:
const serviceEntityPage = (
  <EntityLayout>
    {/* ... your existing routes */}
    <EntityLayout.Route
      if={isGrowthbookAvailable}
      path="/feature-flags"
      title="Feature Flags"
    >
      <EntityGrowthbookFlagsContent />
    </EntityLayout.Route>
  </EntityLayout>
);
```

#### 2. Configure in `app-config.yaml`

```yaml
growthbook:
  baseUrl: ${GROWTHBOOK_BASE_URL}
  secretKey: ${GROWTHBOOK_SECRET_KEY} # For management API (project filtering)
  sdkKeys:
    prod: ${GROWTHBOOK_SDK_KEY_PROD}
    dev: ${GROWTHBOOK_SDK_KEY_DEV}
```

#### 3. Annotate entities in `catalog-info.yaml`

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: my-service
  annotations:
    growthbook.io/enabled: 'true'
    growthbook.io/env: 'prod'
    growthbook.io/project: 'my-project' # Optional: scope flags to a specific project (management API only)
spec:
  type: service
  owner: team-a
```

## Annotations

| Annotation              | Required | Description                                                                  |
| ----------------------- | -------- | ---------------------------------------------------------------------------- |
| `growthbook.io/enabled` | Yes      | Set to `"true"` to enable the GrowthBook tab                                 |
| `growthbook.io/env`     | No       | Environment (default: `prod`)                                                |
| `growthbook.io/project` | No       | Scope flags to a specific project (management API only; ignored in SDK mode) |

## Configuration

The plugin requires the backend plugin (`@backstage-community/plugin-growthbook-backend`) to be installed and configured.

## Screenshots

![GrowthBook Feature Flags Tab](./docs/screenshot.png)

## License

Apache-2.0

## Author

Zaki Hanafiah <zaki@zakhov.com>
