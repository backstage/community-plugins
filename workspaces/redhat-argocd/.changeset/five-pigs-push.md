---
'@backstage-community/plugin-redhat-argocd': major
---

# What is the breaking change?

Removes registration of the K8s API factory to prevent issues with the Kubernetes plugin. Users will now need to set up the K8s plugin as a prerequisite using the installation and configuration guides.

# Why was this needed?

This removes the external `@janus-idp/shared-react` dependency. This standardizes the plugin to Backstage's standards.

# How should consumers update their code?

As a prerequisite, please install and configure the frontend and backend Kubernetes plugins by following the [installation](https://backstage.io/docs/features/kubernetes/installation/) and [configuration](https://backstage.io/docs/features/kubernetes/configuration/) guides.
