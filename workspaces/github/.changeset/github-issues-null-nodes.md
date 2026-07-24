---
'@backstage-community/plugin-github-issues': patch
---

Fixed the GitHub Issues card failing with `Cannot read properties of null (reading 'updatedAt')` / repeated "Resource limits for this query exceeded." errors on entities (typically groups) that own many repositories.
