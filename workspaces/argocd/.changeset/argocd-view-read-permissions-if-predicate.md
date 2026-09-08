---
'@backstage-community/plugin-argocd': patch
'@backstage-community/plugin-argocd-backend': patch
---

Added an extension `if` predicate so the Argo CD entity tabs are only shown when the user is authorized for `argocd.view.read`.

Updated the backend development harness to use RBAC-backed permissions for local workspace development.
