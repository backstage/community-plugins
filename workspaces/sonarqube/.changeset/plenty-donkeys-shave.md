---
'@backstage-community/plugin-sonarqube-backend': minor
---

Fetch `security_hotspots`, `sqale_index` and `ncloc_language_distribution` alongside the existing metrics.

The summary already returns `security_hotspots_reviewed` (the percentage of hotspots reviewed) and `sqale_rating` (the maintainability grade), but neither carries the underlying figure: the number of security hotspots, and the technical debt in minutes. Consumers wanting to display a hotspot count or a debt duration have no way to obtain them, because the metric list is fixed and this plugin holds the only SonarQube credential. `ncloc_language_distribution` is included for the same reason — it is the only source of a project's language breakdown for consumers whose SCM does not provide one.

All three are standard SonarQube metrics, and `metricsToQuery` already filters against `api/metrics/search`, so an instance that does not support one simply omits it.
