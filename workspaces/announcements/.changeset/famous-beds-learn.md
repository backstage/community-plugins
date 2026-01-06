---
'@backstage-community/plugin-announcements-react': patch
---

Remove limit and improve performance when fetching teams from catalog by using `getEntitiesByRefs`. This also resolves issues where teams beyond the default page size limit were not being retrieved.
