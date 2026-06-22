---
'@backstage-community/plugin-servicenow': major
---

The ServiceNow plugin is actively transitioning from Material-UI (MUI) to Backstage UI (BUI). Progress includes: migrated layout components using BUI's Box and Text, replaced MUI icons with Remix Icons, and implemented CSS Modules for styling with proper spacing (24px 16px 24px 20px) and alternating row backgrounds. Remaining work involves replacing MUI Table components (TableBody, TableRow, TableCell, TablePagination, TableSortLabel) and Form components (Autocomplete, Checkbox, TextField). Once completed, the plugin will achieve full BUI compliance, removing all MUI dependencies while maintaining functionality and design consistency.
