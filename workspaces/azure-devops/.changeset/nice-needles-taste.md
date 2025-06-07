---
'@backstage-community/plugin-azure-devops-backend': patch
'@backstage-community/plugin-azure-devops': patch
---

Deprecated `getRepoBuilds` on the frontend and backend along with related code. The are no usages of this method as it was replaced by `getBuildRuns` well over a year ago. This will be removed in a future release.
