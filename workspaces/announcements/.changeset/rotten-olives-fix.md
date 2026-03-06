---
'@backstage-community/plugin-announcements': minor
---

Migrate Announcements Banner to the Backstage UI using the Alert component.

This change also removes the `variant` React prop. If you were using the prop with the `block` or `floating` values, it can be safely removed, as the banner now uses the Backstage UI Alert default style.
