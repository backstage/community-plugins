---
'@backstage-community/plugin-copilot': patch
---

Moved `@mui/x-charts` back from v9 to v8, the newest major that still supports MUI v5. Version 9 requires `@mui/material` v7.3 or later, while this plugin and Backstage apps use MUI v5. The charts keep the keyboard navigation and the look they had on v9.
