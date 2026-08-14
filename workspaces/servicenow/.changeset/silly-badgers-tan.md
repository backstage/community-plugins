---
'@backstage-community/plugin-servicenow-backend': patch
'@backstage-community/plugin-servicenow': patch
'@backstage-community/plugin-servicenow-common': patch
---

Improve automated coverage for plugin init, Table API client query contracts, and frontend backend client wiring so Backstage version bumps fail in CI when those surfaces break. The backend client now includes the entity annotation field in ServiceNow incident queries.
