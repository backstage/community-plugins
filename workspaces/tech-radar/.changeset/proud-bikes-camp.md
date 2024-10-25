---
'@backstage-community/plugin-tech-radar': major
---

The plugin now fetches data from the `@backstage-community/plugin-tech-radar-backend` plugin.

If you are providing a custom API via `techRadarApiRef`, this change will not affect you. However, if you are using the default API with the default mocked data, you will need to install the `@backstage-community/plugin-tech-radar-backend` plugin.

**BREAKING**: Additionally, several types have been moved to the `@backstage-community/plugin-tech-radar-common` plugin. If you are using `TechRadarLoaderResponse`, `RadarEntry`, `RadarQuadrant`, or `RadarRing`, you will need to import them from the `@backstage-community/plugin-tech-radar-common` plugin.
