---
'@backstage-community/plugin-github-issues': patch
---

Fixed the GitHub Issues card failing to load for entities that own a repository whose name starts with a number (for example `123-service`).
