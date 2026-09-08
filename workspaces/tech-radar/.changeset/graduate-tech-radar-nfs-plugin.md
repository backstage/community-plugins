---
'@backstage-community/plugin-tech-radar': major
---

**BREAKING**: The New Frontend System (NFS) plugin has been promoted from the `./alpha` subpath to the primary `.` entry point. The legacy plugin has been moved to the new `./legacy` subpath.

Migration steps:

- If you were importing from `@backstage-community/plugin-tech-radar/alpha` to use the NFS plugin, update your imports to `@backstage-community/plugin-tech-radar`.
- If you were importing from `@backstage-community/plugin-tech-radar` (the legacy plugin), update your imports to `@backstage-community/plugin-tech-radar/legacy`.
- Custom `TechRadarApi` implementations can continue to import `TechRadarApi` and `techRadarApiRef` from `@backstage-community/plugin-tech-radar`, or from `@backstage-community/plugin-tech-radar/legacy`.

The `./alpha` subpath has been removed because this plugin does not ship translations.
