---
'@backstage-community/plugin-kiali-react': patch
'@backstage-community/plugin-kiali': patch
---

Fix for graph loading issue – it was not rendering when the page was first displayed, only after a refresh.
Added detail pages as a drawer that opens when clicking on each workload, service, or application link.
