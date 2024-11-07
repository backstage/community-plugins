---
'@backstage-community/plugin-topology': patch
---

Added `prepublish` script to correct `style-inject` module path references in packed files, ensuring proper resolution and avoiding runtime errors in the published package. And reverted `build` script.
