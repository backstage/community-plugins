---
'@backstage-community/plugin-rbac-backend': patch
---

Conditional policy reconciliation no longer deletes stored conditions when validation or permission metadata lookup fails during reload. Pending additions are staged first; removals apply only after all additions succeed.
