# Copilot V2 Migration Guide

This guide is for existing users of the Copilot Backstage plugin who are upgrading from the older dashboard and ingestion model to the V2 report-based implementation.

## Why This Migration Was Made

GitHub replaced the older Copilot usage endpoints with a report-based API built around signed download URLs and the `2026-03-10` API version.

That change required the plugin to move from direct metrics fetching to a V2 ingestion flow that:

1. Requests report envelopes from GitHub.
2. Downloads JSON or NDJSON report documents from signed URLs.
3. Parses the report payloads into plugin-managed V2 database tables.
4. Serves the new default dashboard from those V2 tables.

The migration is therefore required to stay aligned with the current GitHub Copilot metrics API.

## What Changed

### Dashboard Routing

- `/copilot` now opens the V2 dashboard by default.
- `/copilot/v2` is the explicit V2 route.
- `/copilot/legacy` is the legacy dashboard route.
- `/copilot/enterprise` and `/copilot/organization` remain available as backward-compatible legacy routes.

If you want a visible navigation link to the legacy dashboard during rollout, set `copilot.showLegacyView: true` in frontend config.

### Configuration Changes

Required backend settings:

- `copilot.host`
- At least one of `copilot.enterprise` or `copilot.organization`

New backend migration settings:

- `copilot.backfillFromDate`: Earliest V2 historical date to ingest. Must be `2025-10-10` or later.
- `copilot.backfillDelayMs`: Delay between per-day backfill requests.
- `copilot.ingestTeams`: Enables ingestion of user and user-team reports so team-level filtering can be derived in V2.

New frontend settings relevant to migration:

- `copilot.defaultView`: Chooses the default scope when both enterprise and organization are configured.
- `copilot.showLegacyView`: Shows a sidebar link to the legacy dashboard.

### Storage Changes

New V2 data is stored in new plugin tables that match the GitHub report structure:

- `copilot_daily_totals`
- `copilot_pr_metrics`
- `copilot_metrics_by_feature`
- `copilot_metrics_by_ide`
- `copilot_metrics_by_language_feature`
- `copilot_metrics_by_model_feature`
- `copilot_metrics_by_language_model`
- `copilot_metrics_by_cli`
- `copilot_user_metrics`
- `copilot_user_teams`
- `copilot_ingestion_log`

These tables are separate from the older schema used by the legacy dashboard. During migration, the plugin keeps legacy read endpoints available under `/api/copilot/legacy/*` while V2 backfill is validated.

### AI Credits Consumption (Team-level)

GitHub added a per-user `ai_credits_used` metric to the Copilot usage metrics
report on 2026-06-19. This value is only available in the user-level
(`users-1-day`) report and is not exposed at the organization or enterprise
level. The plugin ingests it into `copilot_user_metrics.ai_credits_used` and,
because team metrics are derived from user data, rolls it up into
`copilot_daily_totals.total_ai_credits_used` for each team.

In the dashboard a **Consumption** tab appears only when a team is selected from
the team drop-down. It shows the total AI credits used over the selected
timeframe along with a chart of daily consumption.

## Upgrade Steps

### 1. Upgrade The Plugin And Run Migrations

Upgrade the frontend and backend packages, then start the backend so the V2 migrations create the new tables.

### 2. Update Config

Add or verify the Copilot settings in `app-config.yaml`.

```yaml
copilot:
  host: github.com
  enterprise: my-enterprise
  organization: my-organization
  defaultView: enterprise
  showLegacyView: true
  backfillFromDate: 2025-10-10
  backfillDelayMs: 200
  ingestTeams: true
```

Notes:

- Use `defaultView` only when both enterprise and organization are configured.
- Set `showLegacyView: true` during migration if you want an explicit sidebar entry for the old dashboard.
- Set `ingestTeams: true` if you want team filtering in the V2 UI. This increases ingestion volume and storage because the backend will ingest `users-1-day` and `user-teams-1-day` reports.

### 3. Backfill Historical Data

The scheduled V2 task performs gap-fill ingestion from `copilot.backfillFromDate` up to yesterday.

GitHub's report API exposes historical data back to `2025-10-10`, which means you can backfill V2 data for October 2025 onward.

If you want to trigger a backfill immediately instead of waiting for the scheduler, call:

- `POST /api/copilot/v2/backfill`
- `GET /api/copilot/v2/backfill/status`

Example request body:

```json
{
  "fromDate": "2025-10-10",
  "toDate": "2025-10-31",
  "type": "organization",
  "entityId": "my-organization"
}
```

The request returns `202 Accepted` and starts the backfill asynchronously.

### 4. Verify The V2 Dashboard

After backfill has populated recent and historical periods:

1. Open `/copilot` and confirm the V2 dashboard loads.
2. Open `/copilot/v2` directly and verify the expected scope is selected.
3. If `showLegacyView` is enabled, compare results with `/copilot/legacy` during the transition period.
4. If team filtering is required, confirm `ingestTeams` is enabled and that team options appear in the V2 dashboard.

## Legacy Dashboard Guidance

The legacy dashboard remains available for transition and comparison, but it should no longer be documented as the primary experience.

- Preferred experience: `/copilot` or `/copilot/v2`
- Legacy fallback: `/copilot/legacy`
- Legacy sidebar link: visible only when `copilot.showLegacyView: true`

The intent is to keep the legacy route available while operators confirm that V2 backfill covers the periods they care about.

## Recommended Rollout For Existing Users

1. Enable V2 and keep `showLegacyView: true` for a transition period.
2. Backfill from `2025-10-10` forward.
3. Verify current and historical data in V2.
4. Confirm that team filtering works if you need it.
5. Treat `/copilot/legacy` as a temporary fallback rather than the default route.
