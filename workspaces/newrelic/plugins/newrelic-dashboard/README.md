# New Relic Dashboard Plugin

Welcome to the newrelic-dashboard plugin!

## Features

- Adds New Relic Dashboard Pages Links to Overview section of the catalog
- Shows Snapshots of dashboards in New Relic

## Getting started

This plugin requires the `@backstage-community/plugin-newrelic-dashboard-backend` backend plugin, which communicates directly with New Relic's NerdGraph (GraphQL) API.

To generate a New Relic API Key, you can visit this [link](https://one.newrelic.com/launcher/api-keys-ui.api-keys-launcher)

1. Install the backend plugin:

```bash
yarn --cwd packages/backend add @backstage-community/plugin-newrelic-dashboard-backend
```

2. Add the following to your `app-config.yaml`:

```yaml
# app-config.yaml
newRelicDashboard:
  apiToken: ${NEW_RELIC_USER_KEY}
  # Optional — defaults to https://api.newrelic.com/graphql (US)
  # For EU accounts, use:
  # graphUrl: https://api.eu.newrelic.com/graphql
```

3. Add the following to `EntityPage.tsx` to display New Relic Dashboard Tab

```tsx
// In packages/app/src/components/catalog/EntityPage.tsx
import {
  isNewRelicDashboardAvailable,
  EntityNewRelicDashboardContent,
  EntityNewRelicDashboardCard,
} from '@backstage-community/plugin-newrelic-dashboard';

const serviceEntityPage = (
  <EntityLayout>
    {/* other tabs... */}
    <EntityLayout.Route
      if={isNewRelicDashboardAvailable}
      path="/newrelic-dashboard"
      title="New Relic Dashboard"
    >
      <EntityNewRelicDashboardContent />
    </EntityLayout.Route>
```

4. Add the following in `EntityPage.tsx` to display dashboard links in overview page

```tsx
const overviewContent = (
    {/* other tabs... */}
    <EntitySwitch>
      <EntitySwitch.Case if={isNewRelicDashboardAvailable}>
        <Grid item md={6} xs={12}>
          <EntityNewRelicDashboardCard />
        </Grid>
      </EntitySwitch.Case>
    </EntitySwitch>
```

5. Add `newrelic.com/dashboard-guid` annotation in catalog descriptor file

To Obtain the dashboard's GUID: Click the info icon by the dashboard's name to access the See metadata and manage tags modal and see the dashboard's GUID.

```yaml
# catalog-info.yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  # ...
  annotations:
    newrelic.com/dashboard-guid: <dashboard_guid>
spec:
  type: service
```

All set, you will be able to see the plugin in action!

## New Frontend System

### Setup

If you're using [feature discovery](https://backstage.io/docs/frontend-system/architecture/app/#feature-discovery), the plugin should be automatically discovered and enabled. Otherwise, you can manually enable the plugin by adding it to your app:

```tsx
// packages/app/src/App.tsx
import newrelicDashboardPlugin from '@backstage-community/plugin-newrelic-dashboard/alpha';

const app = createApp({
  features: [
    // ...
    newrelicDashboardPlugin,
  ],
});
```

### Extensions

The following extensions are available in the plugin:

- `api:newrelic-dashboard`
- `entity-content:newrelic-dashboard/EntityNewRelicDashboardContent`
- `entity-card:newrelic-dashboard/EntityNewRelicDashboardCard`
