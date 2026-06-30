---
'@backstage-community/plugin-rbac-backend': patch
---

Conditional policy reconciliation no longer deletes stored conditions when validation or permission metadata lookup fails during reload. Pending additions are staged first; overlapping replacements are applied with updateCondition; net-new creates and pure deletes run only after updates/creates succeed.
