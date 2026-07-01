---
'@backstage-community/plugin-announcements-backend': patch
---

Fixed notification link being a relative URL, which caused Slack Block Kit button validation to fail with `invalid_attachments`. The link is now prefixed with `app.baseUrl` from config when available.
