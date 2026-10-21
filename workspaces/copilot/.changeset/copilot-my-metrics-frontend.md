---
'@backstage-community/plugin-copilot': minor
---

Added a privacy-scoped, individual ("my Copilot metrics") view showing only the signed-in user's own Copilot usage and consumption. It is mounted by default as a `/copilot/me` sub-page of the main Copilot Insights page, and can be re-attached elsewhere by overriding the `sub-page:copilot/me` extension in a frontend module.

This view reuses the same charts and controls as the main dashboard, scoped entirely to data returned by the backend's privacy-scoped `GET /v2/me/dashboard` endpoint — it has no way to request another user's or a team's metrics.

The plugin exports `myMetricsApiRef`, `MyMetricsApi`, `MyDashboardParams`, and
`MyMetricsContent` for consumers that customize where this view is mounted.
