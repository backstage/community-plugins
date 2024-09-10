---
'@backstage-community/plugin-catalog-backend-module-azure-devops-annotator-processor': minor
'@backstage-community/plugin-azure-devops-backend': minor
'@backstage-community/plugin-azure-devops': minor
---

**BREAKING** This change removes the deprecated `AzureDevOpsAnnotatorProcessor` from `@backstage-community/plugin-azure-devops-backend`. It also removes the export of `AzureDevOpsAnnotatorProcessor` from `@backstage-community/plugin-catalog-backend-module-azure-devops-annotator-processor`. Please install this processor using [the New Backend System setup](https://github.com/backstage/community-plugins/tree/main/workspaces/azure-devops/plugins/catalog-backend-module-azure-devops-annotator-processor#setup), which is now the default.
