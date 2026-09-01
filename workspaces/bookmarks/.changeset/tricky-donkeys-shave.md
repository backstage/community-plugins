---
'@backstage-community/plugin-bookmarks': patch
---

Fix config schema loading failing for the published package. `config.d.ts` referenced a type from the `src` folder, which is not shipped in the npm package, so apps depending on the plugin failed with:

```
Error: The TypeScript configuration schema for package '@backstage-community/plugin-bookmarks' contains an error - node_modules/@backstage-community/plugin-bookmarks/config.d.ts(17,38): error TS2307: Cannot find module './src/hooks/useCustomProtocol' or its corresponding type declarations.
```

The schema is now self-contained.
