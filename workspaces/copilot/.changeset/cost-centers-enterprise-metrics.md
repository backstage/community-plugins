---
'@backstage-community/plugin-copilot-backend': minor
'@backstage-community/plugin-copilot': minor
'@backstage-community/plugin-copilot-common': minor
---

Add opt-in cost-center filtering and a separate **No cost center** dashboard scope. Incomplete GitHub membership snapshots are not applied, preventing partial rosters from skewing cost-center aggregates. Organization team data requires the GitHub App's Copilot metrics: read permission; 403/404 user-team reports are logged as errors and skipped. Backfills preserve existing totals and limit newly required user, team, and cost-center data to GitHub's rolling report window.
