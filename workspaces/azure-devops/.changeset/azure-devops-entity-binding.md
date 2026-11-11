---
'@backstage-community/plugin-azure-devops-backend': patch
---

Azure DevOps data shown on an entity page is now limited to the projects, repositories and pipelines configured for that entity. The deprecated `azureDevOps.token` setting is now only used for the host set in `azureDevOps.host`; credentials for any other host must be configured under `integrations.azure`.
