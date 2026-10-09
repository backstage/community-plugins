---
'@backstage-community/plugin-copilot-backend': minor
'@backstage-community/plugin-copilot-common': minor
'@backstage-community/plugin-copilot': minor
---

Add support for the new GitHub Copilot "AI credits consumed per user" metric (`ai_credits_used`).

The per-user metric is now ingested into `copilot_user_metrics` and aggregated to team level
(`total_ai_credits_used` on `copilot_daily_totals`). A new **Consumption** tab is shown in the V2
dashboard when a team is selected, displaying the total AI credits used and a chart of consumption
over the selected timeframe. AI credits are only exposed by the user-level report, so the tab is only
available for team-scoped views.
