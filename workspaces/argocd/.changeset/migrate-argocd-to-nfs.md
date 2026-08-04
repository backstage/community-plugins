---
'@backstage-community/plugin-argocd': minor
---

Migrate ArgoCD plugin to the new frontend system. NFS extensions are now the default export using `createFrontendPlugin`, `ApiBlueprint`, and `EntityContentBlueprint`. Legacy frontend system exports are preserved under the `/legacy` subpath for backwards compatibility.
