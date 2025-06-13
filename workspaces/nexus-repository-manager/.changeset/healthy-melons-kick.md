---
'@backstage-community/plugin-nexus-repository-manager': patch
---

Replaced internal usage of `formatByteSize` with a local implementation using the `filesize` library, matching the original output format.
