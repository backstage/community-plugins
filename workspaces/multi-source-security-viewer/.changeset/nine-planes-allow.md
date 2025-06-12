---
'@backstage-community/plugin-multi-source-security-viewer': patch
---

Replaced usage of `downloadLogFile` from `@janus-idp/shared-react` with a local implementation based on PatternFly’s `CodeEditor`. This also removes the `file-saver` dependency.
