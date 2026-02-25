---
'@backstage-community/plugin-growthbook': minor
'@backstage-community/plugin-growthbook-backend': minor
---

Initial release of GrowthBook feature flags plugin for Backstage.

- Frontend plugin: display feature flags on entity pages with type badges and default values, project filtering via button group, alphabetical sorting, and JSON detail dialog for complex values
- Backend plugin: proxy for GrowthBook management API with client-side project filtering, 60-second flag cache, and SDK API fallback when no secret key is configured
