---
'@backstage-community/plugin-sentry': patch
---

Fixed issue list not displaying data when issues are fetched asynchronously. Replaced `useState` with `useMemo` for filtered issues so the list properly updates when data arrives from the Sentry API. Also added a guard clause in `ErrorGraph` to handle missing stats data gracefully.
