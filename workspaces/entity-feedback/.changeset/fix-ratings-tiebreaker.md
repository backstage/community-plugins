---
'@backstage-community/plugin-entity-feedback-backend': patch
---

Fixed a bug where casting a vote and quickly changing it (e.g. clicking Like then immediately clicking Dislike) could double-count both ratings instead of replacing the earlier one with the later one, when both writes landed within the same second.
