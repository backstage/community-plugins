---
'@backstage-community/plugin-announcements-react': major
'@backstage-community/plugin-announcements': major
---

Announcement banners can now be dismissed individually. Previously, dismissing one banner could also hide older announcements the user had not yet seen; each announcement is now tracked separately so dismissing one no longer affects the others.

**BREAKING**: The `AnnouncementsApi` interface now requires two additional methods for tracking dismissed announcements. Consumers that provide their own implementation of `AnnouncementsApi` (for example, custom clients or test mocks) must implement these new methods. Consumers that use the built-in client require no changes. Previously seen announcements continue to be respected through the existing last-seen fallback.
