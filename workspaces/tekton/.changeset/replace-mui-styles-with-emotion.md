---
'@backstage-community/plugin-tekton': patch
---

Replaced legacy `@mui/styles` `StylesProvider` with Emotion `CacheProvider` in `TektonStylesProvider` to scope sx/styled class names and avoid CSS collisions with the host app. Removed the `@mui/styles` and unused `@mui/lab` dependencies in favor of `@emotion/cache` and `@emotion/react`. Fixed the pipeline run output dialog layout so expanded output sections scroll inside the dialog instead of overflowing its border. Declared `mobx-react` as a direct dependency for pipeline topology components. No breaking API changes.
