---
'@backstage-community/plugin-growthbook': minor
'@backstage-community/plugin-growthbook-backend': minor
'@backstage-community/plugin-growthbook-common': minor
---

Add experiments, experiment results and richer feature flag details (including GrowthBook stale status) to the GrowthBook entity tab. A Flags | Experiments switch appears only when the entity's GrowthBook project has experiments; otherwise the tab behaves as before. These features require the Management API (`growthbook.secretKey`).

The `GrowthbookFlagsApi` interface gains three methods (`getExperiments`, `getExperimentResults`, `getFlagDetail`). Custom implementations of this interface, including test mocks, must add them. Backend configuration gains an optional `growthbook.appUrl` for experiment links when the GrowthBook web app is served from a different host than `baseUrl`.
