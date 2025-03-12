---
'@backstage-community/plugin-copilot-backend': patch
---

Fix handling of optional editors attribute

The changes to the GitHub CoPilot usage endpoint to the metrics endpoint and
enhances the robustness of the Copilot metrics filtering utilities by properly
handling optional fields in the metrics data structure. The changes
particularly focus on safely accessing the `editors` property which may be
undefined in some metrics records.
