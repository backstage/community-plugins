---
'@backstage-community/plugin-github-actions': patch
---

Truncate commit message to first newline.

This change is to address issue https://github.com/backstage/community-plugins/issues/1246 by truncating the commit message that is displayed at the first newline character and exposes the entire message on hover.
