---
'@backstage-community/plugin-azure-devops': patch
---

Fixed bug in AzureDevOpsClient where multiple entityRef query parameters were appended in case of multiple build definitions, which caused 400 Bad Request error.
