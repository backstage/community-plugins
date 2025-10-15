---
'@backstage-community/plugin-github-actions': patch
---

**BREAKING** Removed the `entityGitHubActionsCard` entirely as this card was mistakenly added as an entity card rather than content.

Disabled the `entityLatestGithubActionRunCard` and `entityLatestGithubActionsForBranchCard` to reduce visual clutter in NFS only.
These can be re-enabled by editing the page layout.
