---
'@backstage-community/plugin-announcements-backend': minor
---

Fixed the `list-announcements` and `get-announcement` actions (for example when used through MCP) failing when an announcement has no "on behalf of" value. Announcements created without "on behalf of" are now returned with the field omitted instead of set to `null`. This also applies to the announcements REST API responses.
