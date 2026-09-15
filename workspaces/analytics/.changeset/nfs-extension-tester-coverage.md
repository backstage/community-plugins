---
'@backstage-community/plugin-analytics-module-ga4': patch
'@backstage-community/plugin-analytics-module-matomo': patch
'@backstage-community/plugin-analytics-module-newrelic-browser': patch
'@backstage-community/plugin-analytics-provider-segment': patch
---

Add tests covering each analytics implementation as the New Frontend System declares it: the APIs it asks the app to inject, and that those APIs produce the analytics client the package provides. Each implementation is now exported from its module, so apps that build against the module directly can override it.
