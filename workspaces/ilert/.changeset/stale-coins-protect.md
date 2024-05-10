---
'@backstage-community/plugin-ilert': minor
---

**BREAKING**: `ILertClient` now requires the `fetchApi` to be passed in. This lets the plugin work safely with the upcoming `proxy-backend` [security changes](https://github.com/backstage/backstage/pull/24643).
