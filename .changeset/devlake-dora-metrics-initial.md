---
'@backstage-community/plugin-devlake': minor
'@backstage-community/plugin-devlake-backend': minor
'@backstage-community/plugin-devlake-common': minor
---

Add DevLake DORA Metrics plugin for Backstage

Introduces a new community plugin that surfaces Apache DevLake DORA metrics in Backstage:

- `DoraMetricsPage`: full-page dashboard with team selector, time range presets, metric cards, and trend charts
- `EntityDoraCard`: compact entity card for the catalog, annotated via `devlake.io/project-name`
- Backend plugin with direct MySQL queries against DevLake's domain layer tables
- New Frontend System (NFS) extension points via `/alpha` entry point
- Optional Grafana deep-link per entity via `devlake.grafana.baseUrl` app-config
