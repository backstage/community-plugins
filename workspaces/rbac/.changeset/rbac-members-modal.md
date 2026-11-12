---
'@backstage-community/plugin-rbac': minor
---

Add a scalable members and groups selection modal for large catalogs (more than 100 users/groups), with search, kind/namespace filters, server-side pagination, and sortable Name/Type/Namespace columns. The existing dropdown remains for smaller catalogs. Reopening the modal keeps the current role members checked, and unchecking members updates the role form. The `searchMembers` API now accepts pagination/filter/sort options and returns `{ items, totalItems }`.
