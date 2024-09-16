---
'@backstage-community/plugin-github-issues': minor
---

**BREAKING**: Introduces support for multiple GitHub integrations. The previous behavior of using the first GitHub provider has been changed to use the well-known entity slug annotation `backstage.io/source-location` to determine the appropriate integration. If the entity does not provide this annotation, the default hostname `github.com` will be used. If you previously relied on the old behavior and are using a custom GitHub instance, please ensure that your entities include the location annotation.
