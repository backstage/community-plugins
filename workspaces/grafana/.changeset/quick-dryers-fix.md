---
'@backstage-community/plugin-grafana': patch
---

fixed bug in Constants.ts/alertSelectorFromEntity. This method always returns string before. It can return string or string[] now.
