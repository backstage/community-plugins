---
'@backstage-community/plugin-analytics-module-matomo': minor
---

Added enhanced identity-aware tracking so Matomo records page views only after a userId is available, fixing the issue where navigate events fired anonymously despite `identity` being enabled
