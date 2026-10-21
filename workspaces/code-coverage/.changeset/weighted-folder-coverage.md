---
'@backstage-community/plugin-code-coverage': patch
---

Folder coverage in the file explorer is now covered lines divided by tracked lines, matching the overall line coverage. It was the unweighted average of the folder's files, so small, well-covered files inflated it. File coverage is no longer rounded down.
