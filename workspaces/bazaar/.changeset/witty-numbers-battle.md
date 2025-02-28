---
'@backstage-community/plugin-bazaar-backend': minor
---

The plugin has been migrated to support the new backend system by default. If you were previously importing from `alpha`, you can now remove this.

## Migrating

```diff
// packages/backend/src/index.ts
-backend.add(import('@backstage-community/plugin-bazaar-backend/alpha'));
+backend.add(import('@backstage-community/plugin-bazaar-backend'));
```

## Installation from scratch

```bash
# From your root directory
yarn --cwd packages/backend add @backstage-community/plugin-bazaar-backend
```

Then add the plugin to your backend in `packages/backend/src/index.ts`:

```ts
const backend = createBackend();
// ...
backend.add(import('@backstage-community/plugin-bazaar-backend'));
```
