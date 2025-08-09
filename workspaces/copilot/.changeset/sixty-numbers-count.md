---
'@backstage-community/plugin-copilot-backend': minor
---

Various performance improvements for larger organizations

- Only gather metrics from teams that have 5 or more members
- To improve performance and reduce the API calls made on large orgs,
  we only need to retrieve the org and enterprise seats once per task.
