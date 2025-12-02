---
'@backstage-community/plugin-announcements-react': patch
'@backstage-community/plugin-announcements': patch
---

Internal refactor to consolidate delete dialog state management in the admin portal. Refactoring categories and tags to the shared component added support for translations which was previously missing.

The refactor includes a new set of translation keys for the generic delete dialog. Please migrate as these will be removed in the next minor release.

### Translation Changes

Added new translation keys for the delete dialog:

- `confirmDeleteDialog.title`
- `confirmDeleteDialog.cancel`
- `confirmDeleteDialog.delete`

Marked the following translation keys as deprecated:

- `deleteDialog.title`
- `deleteDialog.cancel`
- `deleteDialog.delete`
