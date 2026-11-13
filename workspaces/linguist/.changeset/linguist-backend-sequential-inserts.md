---
'@backstage-community/plugin-linguist-backend': patch
---

New catalog entities are now added to the processing queue one at a time instead of all at once, so syncing a large catalog no longer opens many database connections simultaneously and risks exhausting the connection pool.
