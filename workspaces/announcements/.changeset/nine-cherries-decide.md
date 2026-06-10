---
'@backstage-community/plugin-announcements': patch
---

Fixed a bug in the announcement form where editing an existing announcement with an empty end date would prefill the field with today + 7 days, silently setting an `until_date` on announcements that were meant to be open-ended. The field now starts empty for both new and edited announcements.
