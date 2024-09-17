---
'@backstage-community/plugin-github-issues': minor
---

Introduces support for multiple GitHub integrations. The previous behavior of using the first GitHub provider has been changed to use the well-known entity slug annotation `backstage.io/source-location` to determine the appropriate integration. If the entity does not provide this annotation, the first GitHub provider will be used.
