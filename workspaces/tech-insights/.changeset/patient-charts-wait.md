---
'@backstage-community/plugin-tech-insights-maturity': patch
---

`MaturityPage` now mounts `MaturityChartCard` once its Component list has loaded. The card requests check results once, on mount, so it used to send an empty entity list, which the backend reads as every entity with facts, and the chart counted all of them as services. The page shows a progress bar until the list arrives, and the catalog error if the list fails to load.
