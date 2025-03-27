---
'@backstage-community/plugin-copilot-backend': patch
---

team_name column changed to empty string instead of null since
PostgreSQL cant handle unique indexes with null.

This makes it possible for duplicate values to be inserted into
the database for the same day.
