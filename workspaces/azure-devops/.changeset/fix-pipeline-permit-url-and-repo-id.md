---
'@backstage-community/plugin-scaffolder-backend-module-azure-devops': patch
---

Fixed `azure:pipeline:permit` action to use absolute URL in the Pipeline Permissions API request, resolving ECONNREFUSED errors caused by `HttpClient.patch()` resolving relative URLs to `localhost:80`.

Fixed `azure:pipeline:permit` action to automatically resolve compound `{projectId}.{repositoryId}` format for repository resource types, as required by the Azure DevOps Pipeline Permissions API.
