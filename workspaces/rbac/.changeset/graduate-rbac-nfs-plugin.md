---
'@backstage-community/plugin-rbac': major
---

**BREAKING**: The New Frontend System (NFS) plugin has been promoted from the `./alpha` subpath to the primary `.` entry point. The legacy plugin has been moved to the new `./legacy` subpath. The `./alpha` subpath now only exports translations.

Migration steps:

- If you were importing from `@backstage-community/plugin-rbac/alpha` to use the NFS plugin, update your imports to `@backstage-community/plugin-rbac`.
- If you were importing from `@backstage-community/plugin-rbac` (the legacy plugin), update your imports to `@backstage-community/plugin-rbac/legacy`.
- If you were importing translations from `@backstage-community/plugin-rbac/alpha`, those continue to work from the same path.
