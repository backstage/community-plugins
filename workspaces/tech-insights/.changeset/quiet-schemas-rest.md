---
'@backstage-community/plugin-tech-insights-backend-module-jsonfc': patch
---

Running checks no longer reads the fact schemas once per entity and again for every check result. Each schema lookup is reused for a minute, so a bulk run over many entities reads them once. A failed lookup is not kept, and validating checks still reads them fresh.
