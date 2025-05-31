---
'@backstage-community/plugin-rbac': patch
---

Improve `useRoles` hook to support paginated role condition fetching using `Promise.allSettled`, ensuring partial data availability even if individual condition fetch fails.
