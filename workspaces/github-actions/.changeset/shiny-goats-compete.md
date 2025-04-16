---
'@backstage-community/plugin-github-actions': patch
---

Start pagination at page 1 in `api.listBranches` to avoid duplicate branches in WorkflowRunsCard.
