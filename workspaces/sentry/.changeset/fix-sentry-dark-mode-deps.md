---
'@backstage-community/plugin-sentry': patch
---

Moved `@material-ui/core` and `@material-table/core` from `dependencies` to `peerDependencies` to fix dark mode rendering in strict package managers like pnpm. When declared as direct dependencies, these packages could resolve to a separate module instance, causing the plugin's MUI components to miss the ThemeProvider context and fall back to the default light theme.
