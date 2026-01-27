---
'@backstage-community/plugin-copilot-backend': minor
---

Fixes the selection of the GithubApp to use to require you to set "allowedInstallationOwners" for the app you want to use.
This might possibly be a breaking change if you were relying on the default behavior of picking the first app found and only using one app.
