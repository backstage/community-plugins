---
'@backstage-community/plugin-tekton': patch
---

Replaced legacy `@mui/styles` `StylesProvider` with Emotion `CacheProvider` in `TektonStylesProvider` to scope sx/styled class names and avoid CSS collisions with the host app. Removed the `@mui/styles` dependency in favor of `@emotion/cache` and `@emotion/react`. No breaking API changes.
