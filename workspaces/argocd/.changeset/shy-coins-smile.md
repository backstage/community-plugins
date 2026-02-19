---
'@backstage-community/plugin-argocd': minor
---

Add `showInstance` and `showServer` props to deployment components

Adds optional props to `ArgocdDeploymentSummary` and `ArgocdDeploymentLifecycle` components to control visibility of Instance and Server columns/fields:

- `showInstance?: boolean` - Show Instance column/field (default: true)
- `showServer?: boolean` - Show Server column/field (default: true)

**Example usage:**

```tsx
<ArgocdDeploymentSummary showInstance={false} showServer={false} />
<ArgocdDeploymentLifecycle showInstance={false} showServer={false} />
```

This is useful when you have a single ArgoCD instance and want to declutter the UI by hiding redundant information.
