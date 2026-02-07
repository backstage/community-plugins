---
'@backstage-community/plugin-sentry': patch
---

Fixed dark mode support for the Sentry issues table title area. Added explicit theme-aware styles using `makeStyles` for the filter dropdown, form control, and title container so they properly inherit colors from the active Backstage theme instead of using MUI v4 defaults.
