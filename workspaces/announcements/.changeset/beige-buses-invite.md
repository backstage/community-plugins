---
'@backstage-community/plugin-announcements-node': minor
'@backstage-community/plugin-search-backend-module-announcements': minor
---

**breaking** - replace `discoveryApi` param with `discovery` in `DefaultAnnouncementsService.create({})`. This better aligns with Backstage naming conventions.

```diff
const announcementsService = DefaultAnnouncementsService.create({
-   discoveryApi: discoveryServiceRef,
+   discovery: discoveryServiceRef,
});
```

This does not impact most users, but if you are using the `DefaultAnnouncementsService` in a custom service, you will need to update your code.
