---
'@backstage-community/plugin-argocd': major
---

Migrate the Argo CD frontend plugin to the new frontend system (NFS). Legacy (OFS) exports are available from the `/legacy` subpath.

**BREAKING:** The default export is now the NFS plugin created with `createFrontendPlugin`. Named exports (`argocdPlugin`, `ArgocdDeploymentLifecycle`, `ArgocdDeploymentSummary`, `isArgocdConfigured`, `argocdTranslations`, `argocdTranslationRef`) have been moved to the `/legacy` subpath.

To migrate existing OFS usage, update imports from `@backstage-community/plugin-argocd` to `@backstage-community/plugin-argocd/legacy`:

```ts
import {
  argocdPlugin,
  ArgocdDeploymentLifecycle,
  ArgocdDeploymentSummary,
  isArgocdConfigured,
  argocdTranslations,
} from '@backstage-community/plugin-argocd/legacy';
```

For the new frontend system, import the default export and add it to your app features together with the translations module. The Deployment Lifecycle and Deployment Summary entity tabs are registered automatically for entities with Argo CD annotations:

```ts
import argocdPlugin, {
  argocdTranslationsModule,
} from '@backstage-community/plugin-argocd';

export const app = createApp({
  features: [argocdPlugin, argocdTranslationsModule],
});
```
