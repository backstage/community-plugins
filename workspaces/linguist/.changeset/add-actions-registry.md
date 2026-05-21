---
'@backstage-community/plugin-linguist-backend': minor
'@backstage-community/plugin-linguist-common': minor
---

Registered Actions Registry actions for programmatic access to Linguist's language detection. Two actions are now available: `linguist:get-entity-languages` returns the language breakdown for a catalog entity, and `linguist:process-entities` triggers processing of pending and stale entities. Both actions are gated by new permissions (`linguist.entities.read` and `linguist.entities.process`) exported from `@backstage-community/plugin-linguist-common`.
