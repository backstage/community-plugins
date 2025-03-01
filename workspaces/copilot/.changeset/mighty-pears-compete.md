---
'@backstage-community/plugin-copilot-backend': minor
'@backstage-community/plugin-copilot-common': minor
'@backstage-community/plugin-copilot': minor
---

Backend updated for using the new /metrics API that Github Provides.
Added new tables to the database to store all metrics provided by Github.

New metrics output from the backend are currently made compatible with the
old format expected by the frontend in order to make minimum amount of changes
in this version.

The Backend router merges the old saved metrics with the new if the selected
date range overlaps both old and new metrics. Otherwise it selects from eiter
old or new.

It also fetches the maximum availible date range taking into account that
old metrics and/or new metrics are availible from the database.
