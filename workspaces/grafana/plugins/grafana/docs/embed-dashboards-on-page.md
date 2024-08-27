# Embed dashboards on a component page

Adding the `EntityOverviewDashboardViewer` component to an entity's page will embed an "overview" dashboard defined by the entity itself.

```ts
// packages/app/src/components/catalog/EntityPage.tsx

import { EntityOverviewDashboardViewer } from '@backstage-community/plugin-grafana';

// ...

const overviewContent = (
  <Grid container spacing={3} alignItems="stretch">
    <Grid item md={6}>
      <EntityAboutCard variant="gridItem" />
    </Grid>

    <Grid item md={6}>
      {/* Grafana overview dashboard embed start */}
      <EntityOverviewDashboardViewer />
      {/* Grafana overview dashboard embed end */}
    </Grid>

    <Grid item md={4} xs={12}>
      <EntityLinksCard />
    </Grid>
    <Grid item md={8} xs={12}>
      <EntityHasSubcomponentsCard variant="gridItem" />
    </Grid>
  </Grid>
);
```

The dashboard to embed is referenced by its URL, defined by an annotation on the entity:

```ts
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  annotations:
    grafana/overview-dashboard: 'http://grafana/d/qSfS51a4z/some-dashboard?orgId=1&kiosk'
  name: my-entity
  namespace: default
spec:
  # …
```

> **Warning**
>
> Since the `EntityOverviewDashboardViewer` relies on an `iframe` to embed the dashboard,
> Grafana must be configured explicitly to allow embeds.
>
> This can be done by setting [`allow_embedding=true`](https://grafana.com/docs/grafana/latest/setup-grafana/configure-grafana/#allow_embedding) and [`cookie_samesite=none`](https://grafana.com/docs/grafana/latest/setup-grafana/configure-grafana/#cookie_samesite) in your `grafana.ini` configuration file.
>
> Only change these settings if you fully understand and accept the risks.

### Integrating with `EntityPage` (New Frontend System)

Follow this section if you are using Backstage's [new frontend system](https://backstage.io/docs/frontend-system/).

1. Import `grafanaPlugin` in your `App.tsx` and add it to your app's `features` array:

```typescript
import grafanaPlugin from '@backstage-community/plugin-grafana/alpha';

// ...

export const app = createApp({
  features: [
    // ...
    grafanaPlugin,
    // ...
  ],
});
```

2. Next, enable the desired extension in `app-config.yaml`. By default, the cards will only appear on entities
   that are Components. You can override that behavior here by adding a config block, demonstrated below.

```yaml
app:
  extensions:
    - entity-card:grafana/overview-dashboard # can omit the config to keep the default behavior
    - entity-card:grafana/overview-dashboard:
        config:
          filter: kind:component,api,group
```
