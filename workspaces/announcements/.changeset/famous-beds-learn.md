---
'@backstage-community/plugin-announcements-react': patch
---

Fix pagination when fetching teams from catalog by using offset parameter. This resolves issues where teams beyond the default page size limit were not being retrieved.
