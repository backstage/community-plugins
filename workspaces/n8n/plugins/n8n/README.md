# n8n Plugin

Website: [https://n8n.io/](https://n8n.io/)

A Backstage frontend plugin that provides components to view and manage [n8n](https://n8n.io/) workflows directly from entity pages.

## Features

- View all workflows associated with an entity
- See the latest execution status for each workflow
- View execution history with status, duration, and timestamps
- Activate and deactivate workflows
- Overview card showing the latest execution status

## Setup

1. Install the plugin:

```bash
# From your Backstage root directory
yarn --cwd packages/app add @backstage-community/plugin-n8n
```

2. Add and configure the [n8n-backend](../n8n-backend) plugin according to its instructions.

3. Add the `EntityN8nContent` extension to the entity page and `EntityN8nLatestExecutionCard` to the overview page:

```tsx
// In packages/app/src/components/catalog/EntityPage.tsx
import {
  EntityN8nContent,
  EntityN8nLatestExecutionCard,
  isN8nAvailable,
} from '@backstage-community/plugin-n8n';

const serviceEntityPage = (
  <EntityLayout>
    <EntityLayout.Route path="/" title="Overview">
      {/* ... */}
      <EntitySwitch>
        <EntitySwitch.Case if={isN8nAvailable}>
          <Grid item sm={6}>
            <EntityN8nLatestExecutionCard variant="gridItem" />
          </Grid>
        </EntitySwitch.Case>
      </EntitySwitch>
    </EntityLayout.Route>
    {/* other tabs... */}
    <EntityLayout.Route path="/n8n" title="n8n">
      <EntitySwitch>
        <EntitySwitch.Case if={isN8nAvailable}>
          <EntityN8nContent />
        </EntitySwitch.Case>
      </EntitySwitch>
    </EntityLayout.Route>
  </EntityLayout>
);
```

If you are using Backstage's [new frontend system](https://backstage.io/docs/frontend-system/), import the plugin in your `App.tsx` and add it to your app's `features` array:

```typescript
import n8nPlugin from '@backstage-community/plugin-n8n/alpha';

export const app = createApp({
  features: [
    // ...
    n8nPlugin,
    // ...
  ],
});
```

4. Add the n8n annotation to your `catalog-info.yaml`:

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: 'your-component'
  description: 'a description'
  annotations:
    n8n.io/workflow-id: '12345'
spec:
  type: service
  lifecycle: production
  owner: your-team
```

You can also associate multiple workflows with a single entity:

```yaml
metadata:
  annotations:
    n8n.io/workflow-id: '12345,67890'
```

5. Run the app with `yarn start` and navigate to the entity page. You should now see n8n workflow information.

## Exported Components

| Export                         | Type               | Description                                              |
| ------------------------------ | ------------------ | -------------------------------------------------------- |
| `EntityN8nContent`             | Routable Extension | Full page tab with workflows and execution history       |
| `EntityN8nLatestExecutionCard` | Card Extension     | Overview card showing latest execution status            |
| `isN8nAvailable`               | Helper             | Checks if entity has the `n8n.io/workflow-id` annotation |
