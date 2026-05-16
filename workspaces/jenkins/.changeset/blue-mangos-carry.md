---
'@backstage-community/plugin-jenkins-backend': patch
---

Added new actions for Jenkins build management.

Added four actions that expose Jenkins backend capabilities via MCP and scaffolder templates:

- `list-builds` — list all Jenkins projects/jobs for a catalog entity
- `get-build` — fetch details of a specific build by job name and number
- `get-build-logs` — return the full console output of a build
- `trigger-build` — replay a build (enforces `jenkins.execute` permission)
