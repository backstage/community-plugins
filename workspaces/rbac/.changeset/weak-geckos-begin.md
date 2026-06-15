---
'@backstage-community/plugin-rbac': patch
'@backstage-community/plugin-rbac-backend': patch
---

Migrated MUI-v4 references to MUI-v5

Adds New Frontend System dev entrypoints and removes workspace example apps in favor of the plugin `dev/` pattern. Dev backend wiring lives in `plugins/rbac-backend/dev/` (same approach as linguist, feedback, and other FE+BE plugins).
