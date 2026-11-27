---
'@backstage-community/plugin-azure-devops-backend': patch
---

Azure DevOps data shown on an entity page is now limited to the projects, repositories and pipelines configured for that entity.

The README card now checks the `azure.devops.readme.read` permission. It previously checked `azure.devops.pullrequest.read` by mistake, so rules for the README permission had no effect. If your permission policy relies on the pull request permission to control the README card, add a rule for `azure.devops.readme.read`. The README shown is now always the one configured on the entity through the `dev.azure.com/readme-path` or `backstage.io/source-location` annotations, falling back to `README.md` in the repository root. Only Markdown (`.md`) files can be shown, and `dev.azure.com/readme-path` values starting with a dot folder such as `.github/README.md` are no longer rejected.
