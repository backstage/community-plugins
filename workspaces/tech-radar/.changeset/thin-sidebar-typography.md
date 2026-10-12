---
'@backstage-community/plugin-tech-radar': patch
---

Import `Typography` from `@material-ui/core/Typography` in `RadarLegendRing`. The import from `@material-ui/core/Typography/Typography` loaded a second copy of the component, whose styles overrode the app's `Typography` overrides while the radar was shown.
