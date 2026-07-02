---
'@backstage-community/plugin-tech-insights-maturity': minor
---

Add `groupBy` and `categoryOrder` props to `MaturityScorePage`.

By default the component still groups checks by rank tier (Bronze / Silver / Gold).
Setting `groupBy="category"` groups checks by `metadata.category` instead, with
optional ordering via `categoryOrder`. This is useful when maturity checks span
custom pillars rather than the built-in rank tiers.
