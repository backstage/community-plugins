---
'@backstage-community/plugin-scaffolder-backend-module-azure-devops': patch
---

Add new action (azure:pipeline:permit) to Authorize the necessary pipeline resources (e.g., Service Connections, repositories) by executing azure:pipeline:permit; this step ensures that the pipeline has all the required permissions to automatically access the protected resources.
