---
'@backstage-community/plugin-copilot-backend': patch
---

Added support for specifying private GitHub tokens dedicated to the Copilot plugin. This is useful if you don't want to use the same token for both the Copilot backend and other GitHub integrations. To do this, you can specify a new GitHub integration using a string as the host:

```diff
  integrations:
    github:
      - host: github.com
        token: your_token
+     - host: your_copilot_private_token
+       token: your_super_token
+       apiBaseUrl: https://api.github.com
  copilot:
-   host: github.com
+   host: your_copilot_private_token
    enterprise: your_enterprise
```
