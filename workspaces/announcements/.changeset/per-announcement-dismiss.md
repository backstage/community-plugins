---
'@backstage-community/plugin-announcements-react': minor
'@backstage-community/plugin-announcements': minor
---

Added per-announcement dismiss tracking to replace the single-timestamp mechanism. Each banner can now be dismissed independently without affecting the visibility of other announcements. The `AnnouncementsApi` interface gains two new methods: `dismissAnnouncement(id)` and `isAnnouncementDismissed(id)`. The existing `lastSeenDate` mechanism is preserved as a backward-compatible fallback.
