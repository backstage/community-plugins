---
'@backstage-community/plugin-azure-devops': patch
---

Added a check to validate that the `dev.azure.com/readme-path` annotation value does not have a relative path and throw an error with detials if it does as this is not supported by the Azure DevOps API used for this feature.
