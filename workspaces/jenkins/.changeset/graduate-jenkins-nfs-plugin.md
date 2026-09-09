---
'@backstage-community/plugin-jenkins': major
---

**BREAKING**: The New Frontend System (NFS) plugin has been promoted from the `./alpha` subpath to the primary `.` entry point. The legacy plugin has been moved to the new `./legacy` subpath.

Migration steps:

- If you were importing from `@backstage-community/plugin-jenkins/alpha` to use the NFS plugin, update your imports to `@backstage-community/plugin-jenkins`.
- If you were importing from `@backstage-community/plugin-jenkins` (the legacy plugin), update your imports to `@backstage-community/plugin-jenkins/legacy`.

The `./alpha` subpath has been removed because this plugin does not ship translations.
