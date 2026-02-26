---
'@backstage-community/plugin-rbac-backend': patch
---

Backport: Remove usage of breaking imports from @backstage/backend-defaults

This backports the fix from commit 9c7ae87 to avoid compatibility issues when @backstage backend-defaults resolves to 0.13.2, which introduced breaking changes to address a CVE. By removing the problematic import, this plugin remains compatible with both 0.13.1 and 0.13.2 and does not use the code containing the CVE.
