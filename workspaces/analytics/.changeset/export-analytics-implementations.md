---
'@backstage-community/plugin-analytics-module-ga4': patch
'@backstage-community/plugin-analytics-module-matomo': patch
'@backstage-community/plugin-analytics-module-newrelic-browser': patch
'@backstage-community/plugin-analytics-provider-segment': patch
---

Export the analytics implementation extension from each module, so it can be referenced directly rather than only through the module that carries it. Added tests covering the APIs each implementation asks the app to inject and the analytics client it builds.
