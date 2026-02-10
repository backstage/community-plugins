---
'@backstage-community/plugin-tech-insights-maturity': patch
---

Add a `techInsights.maturity.enableCompoundEntityCheck` config option that lets
non-Component entities (System, Domain, Group, API, Resource, etc.) have their
own maturity scorecard. When enabled, the Maturity Summary page additionally
renders the entity's own scorecard alongside the rollup of its related
components. Defaults to `false`, preserving existing behavior.
