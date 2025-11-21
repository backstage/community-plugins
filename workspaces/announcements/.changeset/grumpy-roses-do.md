---
'@backstage-community/plugin-announcements': patch
---

Added analytics event tracking for announcement link clicks. When users click on an announcement with a `link` property, an analytics event is now captured using the [Plugin Analytics](https://backstage.io/docs/plugins/analytics/#capturing-events). This applies to the following components: `AnnouncementsCard`, `AnnouncementPage`,`NewAnnouncementBanner`.
