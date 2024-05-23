# Display alerts on a component page

Adding the `EntityGrafanaAlertsCard` component to an entity's page will display a list of alerts related to that entity.

```ts
// packages/app/src/components/catalog/EntityPage.tsx

import { EntityGrafanaAlertsCard } from '@backstage-community/plugin-grafana';

// ...

const overviewContent = (
  <Grid container spacing={3} alignItems="stretch">
    <Grid item md={6}>
      <EntityAboutCard variant="gridItem" />
    </Grid>

    <Grid item md={6}>
      {/* Grafana alert card start */}
      <EntityGrafanaAlertsCard />
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

Grafana alerts are correlated to Backstage entities using an annotation added in the entity's `catalog-info.yaml` file.

## With Grafana Unified Alerting enabled

If Grafana's [Unified Alerting](https://grafana.com/blog/2021/06/14/the-new-unified-alerting-system-for-grafana-everything-you-need-to-know/) is enabled, alerts are selected by a label defined on them:

```yaml
annotations:
  grafana/alert-label-selector: 'service=awesome-service'
```

The `EntityGrafanaAlertsCard` component will then display alerts matching the given label and value.

## With Grafana Legacy Alerting enabled

If Grafana's [Unified Alerting](https://grafana.com/blog/2021/06/14/the-new-unified-alerting-system-for-grafana-everything-you-need-to-know/) is NOT enabled, alerts are selected by a tag present on the dashboards defining them:

```yaml
annotations:
  grafana/tag-selector: 'my-tag'
```

The `EntityGrafanaAlertsCard` component will then display alerts matching the given tag.
