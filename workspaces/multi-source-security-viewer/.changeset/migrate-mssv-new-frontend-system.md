---
'@backstage-community/plugin-multi-source-security-viewer': major
---

Migrate Multi-Source-Security-Viewer plugin to the new frontend system (NFS). Legacy (OFS) exports are available from the `/legacy` subpath.

**BREAKING:** The default export is now the NFS plugin created with `createFrontendPlugin`. Named exports (`multiSourceSecurityViewerPlugin`, `EntityMultiCIPipelinesContent`, `isMultiCIAvailable`, `isMultiCIAvailableAndEnabled`) have been moved to the `/legacy` subpath.

To migrate existing OFS usage, update imports:

```diff
- import {
-   multiSourceSecurityViewerPlugin,
-   EntityMultiCIPipelinesContent,
-   isMultiCIAvailable,
-   isMultiCIAvailableAndEnabled,
- } from '@backstage-community/plugin-multi-source-security-viewer';
+ import {
+   multiSourceSecurityViewerPlugin,
+   EntityMultiCIPipelinesContent,
+   isMultiCIAvailable,
+   isMultiCIAvailableAndEnabled,
+ } from '@backstage-community/plugin-multi-source-security-viewer/legacy';
```

For the new frontend system, import the default export:

```ts
import multiSourceSecurityViewerPlugin from '@backstage-community/plugin-multi-source-security-viewer';
```

The NFS CI/CD Security tab uses `isMultiCIAvailableAndEnabled`, so it only appears when the entity has both a CI provider annotation and `mssv/enabled: 'true'`. If you previously showed the tab based only on CI annotations (`isMultiCIAvailable`), add the enabled annotation:

```yaml
metadata:
  annotations:
    mssv/enabled: 'true'
```
