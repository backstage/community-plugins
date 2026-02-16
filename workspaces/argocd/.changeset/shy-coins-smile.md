---
'@backstage-community/plugin-argocd': minor
---

Add `hideInstance` and `hideServer` props to deployment components

Adds optional props to `ArgocdDeploymentSummary` and `ArgocdDeploymentLifecycle` components to allow hiding Instance and Server columns/fields:

- `hideInstance?: boolean` - Hide Instance column/field (default: false)
- `hideServer?: boolean` - Hide Server column/field (default: false)

**Example usage:**

```tsx
<ArgocdDeploymentSummary hideInstance hideServer />
<ArgocdDeploymentLifecycle hideInstance hideServer />
```

This is useful when you have a single ArgoCD instance and want to declutter the UI by hiding redundant information.
