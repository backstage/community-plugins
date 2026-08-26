---
'@backstage-community/plugin-topology': major
---

Graduate the Topology New Frontend System plugin from `/alpha` to the main package entry point. Legacy (OFS) exports are available from the `/legacy` subpath. Translations remain on `/alpha` and `/translations`.

**BREAKING:** The default export is now the NFS plugin created with `createFrontendPlugin`. Named OFS exports (`topologyPlugin`, `TopologyPage`) have moved to `@backstage-community/plugin-topology/legacy`.

To migrate existing NFS usage from `/alpha` to the main entry point, update imports from `@backstage-community/plugin-topology/alpha` to `@backstage-community/plugin-topology`.

To migrate existing OFS usage, update imports from `@backstage-community/plugin-topology` to `@backstage-community/plugin-topology/legacy`.

Translations are now available from `/translations` and `/alpha`.
