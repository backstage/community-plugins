---
'@backstage-community/plugin-tech-insights-react': patch
'@backstage-community/plugin-tech-insights': patch
---

Provides a new `TechInsightsScorecardBlueprint` for creating custom entity scorecard content.

The following example shows how to use the blueprint to create scorecards for specific entities. All API entities would get the first scorecard, but only the production APIs would get the second scorecard.

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
