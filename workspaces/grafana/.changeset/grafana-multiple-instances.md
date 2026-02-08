---
'@backstage-community/plugin-grafana': minor
---

Added support for multiple Grafana instances. Organizations with multiple Grafana deployments can now configure them all under the `grafana.hosts` config key and associate entities to specific instances via the `grafana/source-id` annotation. The legacy single-instance `grafana.domain` configuration remains fully supported.
