---
'@backstage-community/plugin-github-actions': minor
---

**BREAKING** Removed the `entityGitHubActionsCard` entirely as this card is meant to be optional but has been hardcoded by default in NFS migration.

Disabled the `entityLatestGithubActionRunCard` and `entityLatestGithubActionsForBranchCard` to reduce visual clutter in NFS only.
These can be re-enabled by editing the page layout.
