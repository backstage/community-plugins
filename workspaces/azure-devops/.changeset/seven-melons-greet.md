---
'@backstage-community/plugin-azure-devops-backend': minor
'@backstage-community/plugin-azure-devops': minor
---

**BREAKING** Removed deprecated `getRepoBuilds` on the frontend and backend along with related code. The are no usages of this method as it was replaced by `getBuildRuns` well over a year ago. The previously deprecated `getBuildDefinitions` has been marked as `private` as it only has a single internal usage that was missed when it was marked as deprecated.
