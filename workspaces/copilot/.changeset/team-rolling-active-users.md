---
'@backstage-community/plugin-copilot-backend': patch
---

Fixed team-filtered V2 dashboard metrics (IDE Active Users, Agent Adoption, IDE
Weekly Active Users) showing 0. Team-level daily totals had no rolling
weekly/monthly active-user counts because GitHub's per-user API only exposes
daily activity. These are now derived on read from the persisted per-user
activity (`copilot_user_metrics` joined with `copilot_user_teams`) using GitHub's
standard rolling windows (7-day weekly, 28-day monthly), including
`monthly_active_agent_users` and `monthly_active_chat_users`.
