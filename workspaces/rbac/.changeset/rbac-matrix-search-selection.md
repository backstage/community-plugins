---
'@backstage-community/plugin-rbac': patch
---

Fixed the permissions matrix showing "No roles found" when the role search hid a checked role. Checked roles outside the search results are now ignored, and the selection applies again once the search is cleared.
