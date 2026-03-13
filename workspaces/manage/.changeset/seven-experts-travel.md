---
'@backstage-community/plugin-manage': patch
---

- Reduced rerendering on user setting changes, and added accordion open/close state to list of prefetched user settings
- Using the pre-fetched owner entities for displaying owners in the entity table to improve UI performance (no need for fetching the entities again)
