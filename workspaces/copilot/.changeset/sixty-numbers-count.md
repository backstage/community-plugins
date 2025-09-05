---
'@backstage-community/plugin-copilot-backend': minor
---

Various performance improvements for larger organizations

- Only gather metrics from teams that have 5 or more members, teams
  with less members will not have any metrics provided by the api as
  documented here https://docs.github.com/en/rest/copilot/copilot-metrics?apiVersion=2022-11-28
- To improve performance and reduce the API calls made on large orgs,
  we only need to retrieve the org and enterprise seats once per task.
