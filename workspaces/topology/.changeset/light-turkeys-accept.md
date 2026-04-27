---
'@backstage-community/plugin-topology': minor
---

Added support for the New Frontend System (NFS), including alpha exports with `EntityContentBlueprint` and `TranslationBlueprint`, a new NFS-compatible dev entry. Removed packages/app and packages/backend to eliminate the need for a full Backstage app setup. Introduced a lightweight Topology backend that imports and relies on the Kubernetes backend plugin for real data integration.
