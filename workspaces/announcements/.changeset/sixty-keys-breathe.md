---
'@backstage-community/plugin-announcements-react': minor
'@backstage-community/plugin-announcements': minor
---

Internal refactor to consolidate delete dialog state management in the admin portal. Refactoring categories and tags to the shared component added support for translations which was previously missing.

The refactor includes a new set of translation keys for the generic delete dialog.

### Translation Changes

Added new translation keys for the delete dialog:

- `confirmDeleteDialog.title`
- `confirmDeleteDialog.cancel`
- `confirmDeleteDialog.delete`

Deprecated the following translation keys:

- `deleteDialog.title`
- `deleteDialog.cancel`
- `deleteDialog.delete`
