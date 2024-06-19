# Display dashboards on a component page

Adding the `EntityGrafanaDashboardsCard` component to an entity's page will display a list of dashboards related to that entity.

```ts
// packages/app/src/components/catalog/EntityPage.tsx

import { EntityGrafanaDashboardsCard } from '@backstage-community/plugin-grafana';

// ...

const overviewContent = (
  <Grid container spacing={3} alignItems="stretch">
    <Grid item md={6}>
      <EntityAboutCard variant="gridItem" />
    </Grid>

    <Grid item md={6}>
      {/* Grafana alert card start */}
      <EntityGrafanaDashboardsCard />
      {/* Grafana alert card end */}
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

Grafana dashboards are correlated to Backstage entities using a selector defined by an annotation added in the entity's `catalog-info.yaml` file.
The `EntityGrafanaDashboardsCard` component will then display dashboards matching the given selector.

The following selector will return dashboards that have a `my-service` or a `my-service-slo` tag and have a `generated` tag.

```yml
annotations:
  grafana/dashboard-selector: "(tags @> 'my-service' || tags @> 'my-service-slo') && tags @> 'generated'"
```

Supported variables:

- `title`: title of the dashboard
- `tags`: array of tags defined by the dashboard
- `url`: URL of the dashboard
- `folderTitle`: title of the folder in which the dashboard is defined
- `folderUrl`: URL of the folder in which the dashboard is defined

Supported binary operators:

- `||`: logical or
- `&&`: logical and
- `==`: equality (`===` operator in Javascript)
- `!=`: inequality (`!==` operator in Javascript)
- `@>`: inclusion (`left.includes(right)` in Javascript)

Supported unary operators:

- `!`: logical negation

Note that the `tags @> "my-service"` selector can be simplified as:

```yaml
annotations:
  grafana/dashboard-selector: my-service
```
