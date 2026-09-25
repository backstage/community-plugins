---
'@backstage-community/plugin-grafana': patch
---

The `entity-card:grafana/alerts` and `entity-card:grafana/dashboards` extensions now accept the table options the legacy `EntityGrafanaAlertsCard` and `EntityGrafanaDashboardsCard` components take as props (`paged`, `searchable`, `pageSize`, `sortable`, `title`, and for alerts `showState`) as extension config, so they can be set from `app-config.yaml` in the New Frontend System. Previously the cards always rendered with the defaults there; in particular the alerts card never showed its State column.
