---
'@backstage-community/plugin-growthbook': minor
---

**BREAKING** `growthbookFlagsApiRef` and the `GrowthbookFlagsApi` type are no longer exported. The API between the frontend plugin and its backend is now an internal detail, so it can grow without breaking adopters. This only affects you if you replaced the default client, for example with a custom API factory or a test mock. There is no replacement; if you need to customize it, please open an issue describing your use case.
