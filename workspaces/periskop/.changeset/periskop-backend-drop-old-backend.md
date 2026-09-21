---
'@backstage-community/plugin-periskop-backend': minor
---

Drops support for the old backend system, which removes the deprecated `createRouter` and `RouterOptions` exports.

**BREAKING**: The new backend system plugin is now the default export of the package, and the `./alpha` sub-path export has been removed. If you install the plugin via `backend.add(import('@backstage-community/plugin-periskop-backend/alpha'))`, update the import to `backend.add(import('@backstage-community/plugin-periskop-backend'))`. If you still use the old backend system, please migrate to the new backend system way of installing the plugin.
