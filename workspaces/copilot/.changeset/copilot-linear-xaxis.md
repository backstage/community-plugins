---
'@backstage-community/plugin-copilot': patch
---

Fixed the Copilot dashboard and "My Metrics" per-day charts (active users, chat requests, code completions, model/language usage, lines of code, AI credits) to always render a linear, gap-free x-axis spanning every calendar day in the selected date range. Previously, days with no Copilot activity were silently omitted from the API response and therefore skipped on the x-axis, distorting the visual spacing between data points.
