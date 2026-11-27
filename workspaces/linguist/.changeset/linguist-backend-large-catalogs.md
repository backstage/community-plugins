---
'@backstage-community/plugin-linguist-backend': patch
---

Improved how the scheduled task scales to large catalogs. The entity queries no longer load the stored language results of every entity on each run, the task stops picking up new entities when the scheduler aborts it (for example on timeout) and yields to the event loop between entities. The README now includes guidance for large catalogs.
