---
'@backstage-community/plugin-github-actions': patch
---

Fix bug in `api.listBranches` call pagination to start from page 1
Iterating from page 0 results in a duplicated branch list in the
WorkflowRunsCard filter
