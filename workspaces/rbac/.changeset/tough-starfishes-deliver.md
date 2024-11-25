---
'@backstage-community/plugin-rbac': patch
---

- fix: remove empty summary row
- fix: remove `@janus-idp/cli` / `scalprum` configuration from `package.json`. Users that build and install the plugin from the source code must change their app-config.yaml from `janus-idp.backstage-plugin-rbac` to `backstage-community.plugin-rbac` and drop the module parameter. This matches now other plugins we migrated from the Janus IDP community to the Backstage community plugin and was missed before.
