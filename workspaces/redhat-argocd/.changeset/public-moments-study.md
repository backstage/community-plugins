---
'@backstage-community/plugin-redhat-argocd-backend': minor
'@backstage-community/plugin-redhat-argocd-common': minor
'@backstage-community/plugin-redhat-argocd': minor
---

Adds ArgoCD application discovery from multiple clusters (ArgoCD instances) per Catalog entity. You can now specify multiple ArgoCD instances to fetch ArgoCD applications from in your entity via `argocd/instance-name` annotation, separated by commas. These instance names must match instance names configured in your `app-config.yaml`. Use `argocd/app-selector` annotation to filter ArgoCD applications for your entity across ArgoCD instances and namespaces. Use `argocd/app-name` annotation to filter out single ArgoCD application per ArgoCD instance. Without the `argocd/instance-name` annotation, the plugin now searches all available ArgoCD instances instead of defaulting to the first one. The order of displayed applications is determined by the order of instance names under `argocd/instance-name` annotation. If this annotation is missing, order is determined by the order of instances in the configuration.
