---
'@backstage-community/plugin-code-coverage': patch
---

Fixed the file explorer not opening the coverage view for files at the root of the source directory, cleaned up `./` and `../` segments in reported file paths, and fixed file content not loading for paths containing `&` or `#`.
