---
'@backstage-community/plugin-topology': minor
---

**BREAKING CHANGE (alpha API)**

The New Frontend System entry for Topology no longer exports `topologyCatalogModule` or `topologyTranslationsModule`. Use the default `FrontendPlugin` export from `@backstage-community/plugin-topology/alpha` instead. The Topology entity tab is now gated with `isTopologyAvailable` (requires `backstage.io/kubernetes-id` or `backstage.io/kubernetes-namespace`).

Migration:

```ts
// Before
import {
  topologyCatalogModule,
  topologyTranslationsModule,
} from '@backstage-community/plugin-topology/alpha';

createApp({
  features: [topologyCatalogModule, topologyTranslationsModule],
});

// After
import topologyPlugin from '@backstage-community/plugin-topology/alpha';
import topologyTranslationsModule from '@backstage-community/plugin-topology/translations';

createApp({
  features: [topologyPlugin, topologyTranslationsModule],
});
```

If your app config overrides the Topology entity content extension, update the id from `entity-content:catalog/entity-content-topology` to `entity-content:topology/topology`.
