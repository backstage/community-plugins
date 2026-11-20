---
'@backstage-community/plugin-scaffolder-backend-module-azure-devops': patch
---

Fixed Azure DevOps pipeline runs returning invalid status values, which caused output validation errors for failed or canceled runs. Pipeline run statuses now match the documented lowercase values.
