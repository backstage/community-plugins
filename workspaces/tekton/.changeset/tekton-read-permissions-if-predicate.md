---
'@backstage-community/plugin-tekton': patch
'@backstage-community/plugin-tekton-common': patch
'@backstage-community/plugin-tekton-react': patch
---

Added an extension `if` predicate so the Tekton entity tab is only shown when the user is authorized for `kubernetes.clusters.read` and `kubernetes.resources.read`.
