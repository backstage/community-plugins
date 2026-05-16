# n8n Plugins for Backstage

This workspace contains the frontend and backend plugins for integrating [n8n](https://n8n.io) workflow automation with [Backstage](https://backstage.io).

## Plugins

| Plugin                                                            | Description                                                               |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------- |
| [@backstage-community/plugin-n8n](./plugins/n8n/)                 | Frontend plugin with UI components for viewing and managing n8n workflows |
| [@backstage-community/plugin-n8n-backend](./plugins/n8n-backend/) | Backend plugin that proxies requests to the n8n API                       |

## Features

- View n8n workflows associated with catalog entities
- See execution history with status, duration, and timing details
- Activate and deactivate workflows directly from Backstage
- Latest execution card for entity overview pages
- Annotation-based entity association (`n8n.io/workflow-id`)

## Setup

### Backend

Install the backend plugin:

```bash
# From your Backstage root directory
yarn --cwd packages/backend add @backstage-community/plugin-n8n-backend
```

Add the plugin to your backend in `packages/backend/src/index.ts`:

```typescript
const backend = createBackend();
// ... other plugins
backend.add(import('@backstage-community/plugin-n8n-backend'));
backend.start();
```

### Frontend

Install the frontend plugin:

```bash
# From your Backstage root directory
yarn --cwd packages/app add @backstage-community/plugin-n8n
```

Add the n8n tab to your entity page in `packages/app/src/components/catalog/EntityPage.tsx`:

```tsx
import {
  EntityN8nContent,
  EntityN8nLatestExecutionCard,
  isN8nAvailable,
} from '@backstage-community/plugin-n8n';

// Add to the entity page overview (optional card)
const overviewContent = (
  <Grid container spacing={3}>
    {/* ... other cards */}
    <EntitySwitch>
      <EntitySwitch.Case if={isN8nAvailable}>
        <Grid item md={6}>
          <EntityN8nLatestExecutionCard />
        </Grid>
      </EntitySwitch.Case>
    </EntitySwitch>
  </Grid>
);

// Add as a tab on the entity page
const serviceEntityPage = (
  <EntityLayout>
    {/* ... other tabs */}
    <EntityLayout.Route path="/n8n" title="n8n" if={isN8nAvailable}>
      <EntityN8nContent />
    </EntityLayout.Route>
  </EntityLayout>
);
```

### Configuration

Add the n8n configuration to your `app-config.yaml`:

```yaml
n8n:
  baseUrl: https://your-n8n-instance.com
  apiKey: ${N8N_API_KEY}
```

### Catalog Entity Annotation

Associate n8n workflows with catalog entities using the `n8n.io/workflow-id` annotation:

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: my-service
  annotations:
    n8n.io/workflow-id: '12345'
spec:
  type: service
  lifecycle: production
  owner: team-a
```

For multiple workflows, use comma-separated IDs:

```yaml
metadata:
  annotations:
    n8n.io/workflow-id: '12345,67890'
```

## Components

| Component                      | Type                | Description                                                    |
| ------------------------------ | ------------------- | -------------------------------------------------------------- |
| `EntityN8nContent`             | Routable Extension  | Full tab content with workflows table and execution history    |
| `EntityN8nLatestExecutionCard` | Component Extension | Card showing the latest execution status for the overview page |
| `EntityN8nWorkflowsTable`      | Component Extension | Standalone workflows table                                     |
| `isN8nAvailable`               | Helper              | Check if an entity has the n8n annotation                      |

## Development

To start the plugin in development mode:

```bash
cd workspaces/n8n
yarn install
yarn start
```
