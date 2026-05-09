---
'@backstage-community/plugin-argocd-node': patch
---

Fixed handling of Argo CD instance URLs configured with a trailing slash; API requests now target paths such as `/api/v1/session` correctly instead of producing invalid double-slash URLs.
