---
'@backstage-community/plugin-github-issues': patch
---

Introduces support for multiple GitHub integrations. The previous behavior of using the first GitHub provider has been changed to use the well-known entity slug annotation `backstage.io/source-location` or `backstage.io/managed-by-location` to determine the appropriate provider. If no provider matches the slug, the first GitHub provider will be selected, maintaining the previous behavior.
