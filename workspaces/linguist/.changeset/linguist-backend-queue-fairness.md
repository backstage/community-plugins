---
'@backstage-community/plugin-linguist-backend': patch
---

A failed language analysis is no longer recorded as an empty result, so a processing failure is no longer mistaken for a valid empty language breakdown. Entities that have never been analyzed are now processed before previously failed ones, so new entities are not starved by repeatedly failing ones.
