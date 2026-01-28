---
'@backstage-community/plugin-tech-insights-react': patch
'@backstage-community/plugin-tech-insights': patch
---

Provides a new TechInsightsScorecardBlueprint for providing custom entity scorecard content. The following example shows how
to use the blueprint to create two scorecards filtered to specific entities.

All check ids for an entity will be aggregated and displayed in the scorecard.

```ts
const techInsightsModule = createFrontendModule({
  pluginId: 'tech-insights',
  extensions: [
    TechInsightsScorecardBlueprint.make({
      name: 'apis',
      params: {
        filter: { kind: 'api' },
        title: 'Custom API Scorecard Title',
        checkIds: ['apiDefinitionCheck'],
      },
    }),
    TechInsightsScorecardBlueprint.make({
      name: 'apis-two',
      params: {
        filter: { kind: 'api', 'spec.lifecycle': 'production' },
        title: 'Custom API Scorecard Title TWO - WONT SHOW',
        checkIds: ['groupOwnerCheck'],
      },
    }),
  ],
});
```
