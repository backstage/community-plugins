---
'@backstage-community/plugin-topology': patch
---

Use the PatternFly dark theme for every dark Backstage theme, not only the one with the id `dark`. The plugin now checks the active theme's `variant`, and follows the system color scheme when no theme is selected ("auto").
