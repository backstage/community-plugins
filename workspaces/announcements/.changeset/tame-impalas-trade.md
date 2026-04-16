---
'@backstage-community/plugin-announcements-backend': patch
---

Added actions for announcement management.

Registered four actions that expose the announcements backend via MCP and scaffolder templates:

- `announcements:list-announcements` — list announcements with optional filters for category, tags, active status, and pagination
- `announcements:get-announcement` — fetch full details of a single announcement by ID
- `announcements:create-announcement` — create a new announcement (requires `announcement.entity.create` permission)
- `announcements:delete-announcement` — delete an announcement by ID (requires `announcement.entity.delete` permission)
