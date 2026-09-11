---
'@backstage-community/plugin-topology': patch
---

Added an extension `if` predicate so the Topology entity tab is only shown when the user is authorized for `kubernetes.clusters.read` and `kubernetes.resources.read`.
