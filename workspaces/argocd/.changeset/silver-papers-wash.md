---
'@backstage-community/plugin-argocd-backend': patch
'@backstage-community/plugin-argocd': patch
---

Removed deprecations, switched to using `permissionsRegistry` instead of `permissionIntegrationRouter`. Fixed ERR_HTTP_HEADERS_SENT error when permissions are missing.
