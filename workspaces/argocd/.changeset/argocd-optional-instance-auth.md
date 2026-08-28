---
'@backstage-community/plugin-argocd': patch
'@backstage-community/plugin-argocd-backend': patch
---

Allow Argo CD instance authentication via either an access token or username/password in the config schema. Username and password on each instance are no longer required, matching the documented token-based setup.
