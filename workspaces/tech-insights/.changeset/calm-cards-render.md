---
'@backstage-community/plugin-tech-insights': patch
---

`EntityTechInsightsScorecardCard` no longer needs the Tech Insights page to be mounted. It was a routable extension on the page's route, so it threw on entity pages when `page:tech-insights` was disabled or the page was not installed.
