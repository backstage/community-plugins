---
'@backstage-community/plugin-growthbook': minor
---

**BREAKING** The `GrowthbookFlagsApi` interface has three new required methods: `getExperiments`, `getExperimentResults` and `getFlagDetail`. They back the new experiments and flag details views. This only affects you if you provide your own implementation of `GrowthbookFlagsApi`, for example a custom API factory or a test mock; the default client already implements them.

To migrate, add the methods to your implementation. A minimal version that keeps the new views empty:

```ts
getExperiments: async () => [],
getExperimentResults: async () => ({ available: false, variations: [] }),
getFlagDetail: async key => ({
  key,
  archived: false,
  tags: [],
  isStale: false,
  environments: [],
}),
```
