---
'@backstage-community/plugin-rbac': patch
---

Fixed RBAC table pagination text not being translated in non-English locales by adding `labelDisplayedRows` and `labelRowsPerPage` translation keys and wiring them into all table components.
