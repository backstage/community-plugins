---
'@backstage-community/plugin-argocd': patch
---

Add tests covering the Deployment Lifecycle and Deployment Summary tabs as the New Frontend System declares them: their titles, route paths, the entities they are offered for, what each renders, and the ArgoCD read permission that gates them. The API and entity content extensions are now exported from the plugin module, so apps that build against the module directly can override them.
