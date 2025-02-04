---
'@backstage-community/plugin-announcements-node': minor
---

**breaking** - replace `discoveryApi` param with `discovery` in `DefaultAnnouncementsService.create({})`. This better aligns with Backstage naming conventions.

```diff
const announcementsService = DefaultAnnouncementsService.create({
-   discoveryApi: discoveryServiceRef,
+   discovery: discoveryServiceRef,
});
```
