---
'@backstage-community/plugin-growthbook': minor
'@backstage-community/plugin-growthbook-backend': minor
'@backstage-community/plugin-growthbook-common': minor
---

Show GrowthBook experiments and their results on catalog entities, plus per-environment details and stale status for each feature flag. A Flags | Experiments switch appears only when the entity's GrowthBook project has experiments; otherwise the tab behaves as before. These features need `growthbook.secretKey`. The optional `growthbook.appUrl` sets where experiment links point when the GrowthBook app is on a different host than `baseUrl`.
