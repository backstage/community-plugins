---
'@backstage-community/plugin-github-issues': minor
---

**BREAKING**: Introduces support for multiple GitHub integrations. The previous behavior of using the first GitHub provider has been changed to use the well-known entity slug annotation `backstage.io/source-location` to determine the appropriate integration. If you previously relied on the old behavior, please ensure that your entities include the location annotation.
