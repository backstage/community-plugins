---
'@backstage-community/plugin-pointing-poker': minor
'@backstage-community/plugin-pointing-poker-backend': minor
'@backstage-community/plugin-pointing-poker-common': minor
'@backstage-community/plugin-pointing-poker-backend-module-jira': minor
---

Added a new Pointing Poker plugin for collaborative story point estimation. See the [README](https://github.com/backstage/community-plugins/tree/main/workspaces/pointing-poker/plugins/pointing-poker#readme) for all the details.

Jira access requires an explicit `pointingPoker.providers.jira.allowedProjects` list. Only include projects whose data can be shared with all signed-in Backstage users.
