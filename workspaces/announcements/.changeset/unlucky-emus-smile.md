---
'@backstage-community/plugin-announcements': patch
---

- Add `hideStartAt` React prop to allow hiding the "Start at" date label on announcements card

```diff
- <AnnouncementsCard max={2} />
+ <AnnouncementsCard max={2} hideStartAt />
```
