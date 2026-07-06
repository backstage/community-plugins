---
'@backstage-community/plugin-rbac-backend': patch
---

Conditional policy reconciliation preserves stored conditions when staging or persistence fails, and correctly merges sibling conditions for the same role and resource without conflict errors during reload.
