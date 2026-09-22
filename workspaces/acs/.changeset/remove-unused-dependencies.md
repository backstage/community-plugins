---
'@backstage-community/plugin-acs': patch
---

Removed dependencies that the plugin declared but never used, including `@mui/material`, `@mui/x-data-grid`, `@apollo/client`, `date-fns`, and several PatternFly packages. There is no change in behavior. If your app relied on any of these being installed through this plugin, add them to your own `package.json`.
