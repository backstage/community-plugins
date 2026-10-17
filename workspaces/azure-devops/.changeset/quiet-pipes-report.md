---
'@backstage-community/plugin-scaffolder-backend-module-azure-devops': patch
---

Fixed the `azure:pipeline:run` action failing with an output error when a pipeline run fails or is canceled. The `pipelineRunStatus` output is now one of `succeeded`, `failed`, `canceled` or `unknown`.
