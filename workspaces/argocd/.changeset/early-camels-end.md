---
'@backstage-community/plugin-argocd-backend': patch
'@backstage-community/plugin-argocd': patch
---

Changes the (mostly internal used) pluginId from `argocd` to `backstage-community-argocd` to resolve a conflict with the Argo CD plugin from Roadie. This will allow users to install both plugins in parallel. Since the Backstage Community Argo CD plugin works fine with the Roadie Argo CD Backend plugin the frontend automatically falls back to the `argocd` backend if there is no `backstage-community-argocd` backend available.
