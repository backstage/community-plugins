---
'@backstage-community/plugin-topology': major
---

**BREAKING** Use Kubernetes plugin permissions `kubernetes.clusters.read` and `kubernetes.resources.read` in Topology plugin, remove topology-specific permission `topology.view.read`.
If you are importing `topologyViewPermission` or `topologyPermissions` from `@backstage-community/plugin-topology-common`, the imports need to be updated to instead import from `@backstage/plugin-kubernetes-common`.
