---
'@backstage-community/plugin-tech-insights-maturity': patch
---

`MaturityPage` shows an empty state when the catalog has no Components, instead of mounting `MaturityChartCard` with an empty list. The card would request check results for that empty list, which the backend reads as every entity with facts.
