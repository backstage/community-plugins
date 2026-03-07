# Fairwinds Insights Plugin

This plugin surfaces [Fairwinds Insights](https://www.fairwinds.com/fairwinds-insights) data in Backstage: Vulnerabilities, Cost (MTD), and Action Items for entities that are linked to Insights via the `insights.fairwinds.com/app-groups` annotation.

## Setup

1. Install the frontend plugin:

```bash
# From your Backstage root directory
yarn --cwd packages/app add @backstage-community/plugin-fairwinds-insights
```

2. Install and configure the [Fairwinds Insights backend plugin](../fairwinds-insights-backend/README.md) so the frontend can fetch data.

3. Register the plugin in your app:

```tsx
// In packages/app/src/App.tsx
import { fairwindsInsightsPlugin } from '@backstage-community/plugin-fairwinds-insights';

const app = createApp({
  // ...
  plugins: [fairwindsInsightsPlugin],
});
```

4. Example shape from the plugin schema:

```yaml
# app-config.yaml
fairwindsInsights:
  apiUrl: ${INSIGHTS_URL} # optional; base Fairwinds Insights URL (default: https://insights.fairwinds.com)
  apiKey: ${INSIGHTS_TOKEN} # Bearer token for Insights API
  organization: ${INSIGHTS_ORGANIZATION}
  cacheTTL: 300 # optional; cache TTL in seconds (default: 300)
```

### Entity pages

Add the plugin’s entity cards to the Overview (or other layouts) where you want Insights data. All cards require the `insights.fairwinds.com/app-groups` annotation on the entity.

Example using the same layout as in this workspace’s `packages/app`:

```tsx
// In packages/app/src/components/catalog/EntityPage.tsx
import {
  ActionItemsCard,
  ActionItemsTopCard,
  MTDCostOverviewCard,
  VulnerabilitiesCard,
  ResourcesHistoryPodCountCard,
  ResourcesHistoryCPUCard,
  ResourcesHistoryMemoryCard,
} from '@backstage-community/plugin-fairwinds-insights';

// In your overview content (e.g. overviewContent or defaultEntityPage):
<Grid container spacing={3} alignItems="stretch">
  {/* ... other cards ... */}
  <Grid item md={8} xs={12}>
    <VulnerabilitiesCard />
  </Grid>
  <Grid item md={4} xs={12}>
    <MTDCostOverviewCard />
  </Grid>
  <Grid item md={12} xs={12}>
    <ActionItemsTopCard />
  </Grid>
  <Grid item md={12} xs={12}>
    <ActionItemsCard />
  </Grid>
  <Grid item md={12} xs={12}>
    <ResourcesHistoryPodCountCard />
  </Grid>
  <Grid item md={12} xs={12}>
    <ResourcesHistoryCPUCard />
  </Grid>
  <Grid item md={12} xs={12}>
    <ResourcesHistoryMemoryCard />
  </Grid>
</Grid>;
```

**Annotation:** entities must declare which Fairwinds Insights app group(s) they belong to:

```yaml
# catalog-info.yaml
metadata:
  annotations:
    insights.fairwinds.com/app-groups: <APP_GROUP_NAME>
```

In case of multiple app groups, use comma-separated values.

### Exported components

- **VulnerabilitiesCard** – vulnerability summary for the entity’s app group(s).
- **MTDCostOverviewCard** – month-to-date cost overview.
- **ActionItemsTopCard** – top action items (e.g. by namespace/resource/severity/title).
- **ActionItemsCard** – full action items list (table with filters).
- **ResourcesHistoryPodCountCard** – resource history: pod count over time.
- **ResourcesHistoryCPUCard** – resource history: CPU usage over time.
- **ResourcesHistoryMemoryCard** – resource history: memory usage over time.

All of them use `useFairwindsInsightsApi()` and the backend route `fairwinds-insights`; without the backend plugin and proper config, the cards will not load data.

## New Frontend System

### Setup

If you use [feature discovery](https://backstage.io/docs/frontend-system/architecture/app/#feature-discovery), the plugin may be picked up automatically. Otherwise, add it explicitly:

```tsx
// packages/app/src/App.tsx
import fairwindsInsightsPlugin from '@backstage-community/plugin-fairwinds-insights/alpha';

const app = createApp({
  features: [
    // ...
    fairwindsInsightsPlugin,
  ],
});
```

## Links

- [Fairwinds Insights](https://www.fairwinds.com/fairwinds-insights)
- [Backstage plugin docs](https://backstage.io/docs)
