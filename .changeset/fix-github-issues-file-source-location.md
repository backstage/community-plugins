---
'@backstage-community/plugin-github-issues': patch
---

Fixed `getHostnameFromEntity` to handle `file:` type source-locations gracefully instead of throwing `TypeError: Invalid URL`
