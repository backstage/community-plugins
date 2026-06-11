# Copilot Plugin v2 — Design & Implementation Plan

## Context

The existing copilot plugin was built against the original GitHub Copilot REST API
(`/orgs/{org}/copilot/metrics`, `/enterprises/{enterprise}/copilot/metrics`).
**That API no longer exists as of April 2026.**

GitHub replaced it with a new report-based API (version `2026-03-10`) that works
differently: callers request **download links** to signed URLs pointing at JSON
report documents, then download and parse those documents. The new API also
introduces substantially richer data, including user-level metrics, PR telemetry,
CLI/token usage, and a separate user-teams join report.

This document describes:

1. What the current plugin provides (v1 baseline)
2. How the new API works and what data it provides
3. The schema and architectural differences
4. A design for v2 — built on top of, but cleanly separated from, the existing
   implementation
5. The historical backfill strategy
6. A phased implementation plan

> **Note on the legacy view**: The new API provides data back to **October 10, 2025**.
> The v1 DB already contains data up to April 2026. This means a complete v2 backfill
> from October 2025 fully covers the period stored in the v1 DB — making the legacy
> read path optional rather than essential. The legacy v1 view should be retained only
> as a fallback for data that predates October 2025, and can be hidden by default once
> a full backfill has been confirmed.

---

## 1. Current State (v1 Baseline)

### 1.1 Database Schema

The current schema evolved across five migrations and contains 18 tables.

| Group           | Tables                                                                                                                                           | Purpose                                      |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------- |
| Legacy          | `metrics`                                                                                                                                        | Old flat metrics format (pre-2502 migration) |
| Base            | `copilot_metrics`                                                                                                                                | Per-day engagement totals per entity/team    |
| IDE Completions | `ide_completions`, `ide_completions_language`, `ide_completions_editor`, `ide_completions_editor_model`, `ide_completions_editor_model_language` | Code completion breakdowns                   |
| IDE Chat        | `ide_chats`, `ide_chats_editor`, `ide_chats_editor_model`                                                                                        | Chat breakdowns                              |
| Dotcom          | `dotcom_chats`, `dotcom_chats_model`, `dotcom_prs`, `dotcom_prs_repository`, `dotcom_prs_repository_model`                                       | GitHub.com feature breakdowns                |
| Seats           | `copilot_seats`                                                                                                                                  | Seat utilisation & inactivity analysis       |

All tables share a `(day, type, team_name)` composite unique key (or an equivalent superset for breakdown tables). `type` is `'enterprise'` or `'organization'`.

### 1.2 Backend API

| Method | Path                    | Description                                                        |
| ------ | ----------------------- | ------------------------------------------------------------------ |
| GET    | `/health`               | Health check                                                       |
| GET    | `/metrics`              | Merges v1 + v2 DB data; returns `Metric[]` with optional breakdown |
| GET    | `/engagements`          | Aggregated engagement metrics per feature                          |
| GET    | `/seats`                | Seat utilisation and inactivity percentages                        |
| GET    | `/metrics/period-range` | Earliest–latest date range in DB                                   |
| GET    | `/teams`                | Distinct teams for a given type / date range                       |

### 1.3 Ingestion

A Backstage-scheduled task runs at **2 AM UTC daily** and launches four parallel
sub-tasks:

- Enterprise metrics (all users, no team filter)
- Enterprise team metrics (per team, via GraphQL enumeration)
- Organisation metrics
- Organisation team metrics

Each sub-task calls the GitHub REST API, filters new records against the last
stored day, and batch-inserts using knex conflict-ignore semantics.

### 1.4 Frontend

- `CopilotPage` → `HomePage` (selector) → `EnterprisePage` / `OrganizationPage`
- Shared state via React Context: date range, selected team, show-overall toggle
- Components: `DashboardCards`, `EngagementCharts`, `LanguageCards`, seat charts, team dropdown filter

---

## 2. New GitHub API (2026-03-10)

### 2.1 Endpoints

The new API **does not return metrics directly**. It returns an envelope of
signed download URLs. The caller must then fetch each URL to obtain a JSON
document.

**Enterprise scope**

| Endpoint                                                                         | Document type                         | Notes                                    |
| -------------------------------------------------------------------------------- | ------------------------------------- | ---------------------------------------- |
| `GET /enterprises/{ent}/copilot/metrics/reports/enterprise-1-day?day=YYYY-MM-DD` | Enterprise aggregate for one day      | Day-specific                             |
| `GET /enterprises/{ent}/copilot/metrics/reports/enterprise-28-day/latest`        | Enterprise aggregate, rolling 28 days | Latest window                            |
| `GET /enterprises/{ent}/copilot/metrics/reports/users-1-day?day=YYYY-MM-DD`      | Per-user metrics for one day          | Day-specific                             |
| `GET /enterprises/{ent}/copilot/metrics/reports/users-28-day/latest`             | Per-user metrics, rolling 28 days     | Latest window                            |
| `GET /enterprises/{ent}/copilot/metrics/reports/user-teams-1-day?day=YYYY-MM-DD` | User→team membership for one day      | Join table; teams with < 5 users omitted |

**Organisation scope** — identical paths under `/orgs/{org}/copilot/metrics/reports/…`

**Response envelope**

```json
{
  "download_links": ["https://…"],
  "report_day": "2025-10-01"         // 1-day variant
  // OR
  "report_start_day": "…",
  "report_end_day": "…"              // 28-day variant
}
```

The signed URLs **expire**. Documents must be downloaded promptly after requesting
links.

Historical data is available from **October 10, 2025** up to 1 year back.

### 2.2 Enterprise-Level Document Schema

Each downloaded enterprise report is an array of enterprise objects, each containing a `day_totals` array:

```json
[
  {
    "enterprise_id": "1",
    "report_start_day": "2025-09-04",
    "report_end_day": "2025-10-01",
    "day_totals": [
      {
        "day": "2025-10-01",
        "enterprise_id": "1",
        "daily_active_users": 2,
        "weekly_active_users": 2,
        "monthly_active_users": 2,
        "daily_active_cli_users": 2,
        "monthly_active_agent_users": 0,
        "monthly_active_chat_users": 0,
        "code_acceptance_activity_count": 2,
        "code_generation_activity_count": 2,
        "loc_added_sum": 30,
        "loc_deleted_sum": 0,
        "loc_suggested_to_add_sum": 35,
        "loc_suggested_to_delete_sum": 0,
        "user_initiated_interaction_count": 0,
        "pull_requests": {
          /* PR telemetry — see §2.4 */
        },
        "totals_by_cli": {
          /* CLI usage — see §2.5 */
        },
        "totals_by_feature": [{ "feature": "code_completion" /* metrics */ }],
        "totals_by_ide": [{ "ide": "vscode" /* metrics */ }],
        "totals_by_language_feature": [
          { "language": "unknown", "feature": "code_completion" /* metrics */ }
        ],
        "totals_by_language_model": [],
        "totals_by_model_feature": []
      }
    ]
  }
]
```

### 2.3 User-Level Document Schema

```json
[
  {
    "user_id": 1,
    "user_login": "login1",
    "day": "2025-10-01",
    "enterprise_id": "1",
    "code_acceptance_activity_count": 1,
    "code_generation_activity_count": 1,
    "loc_added_sum": 8,
    "loc_deleted_sum": 0,
    "loc_suggested_to_add_sum": 10,
    "loc_suggested_to_delete_sum": 0,
    "user_initiated_interaction_count": 0,
    "used_agent": false,
    "used_chat": false,
    "used_cli": true,
    "totals_by_cli": {
      /* … */
    },
    "totals_by_feature": [
      {
        /* … */
      }
    ],
    "totals_by_ide": [
      {
        /* … */
      }
    ],
    "totals_by_language_feature": [
      {
        /* … */
      }
    ],
    "totals_by_language_model": [],
    "totals_by_model_feature": []
  }
]
```

### 2.4 Pull Request Metrics (inside `day_totals`)

```json
{
  "total_created": 2,
  "total_merged": 2,
  "total_reviewed": 1,
  "total_created_by_copilot": 1,
  "total_merged_created_by_copilot": 1,
  "total_merged_reviewed_by_copilot": 1,
  "total_reviewed_by_copilot": 1,
  "total_suggestions": 1,
  "total_applied_suggestions": 1,
  "total_copilot_suggestions": 1,
  "total_copilot_applied_suggestions": 1,
  "median_minutes_to_merge": 2.5,
  "median_minutes_to_merge_copilot_authored": 2.5,
  "median_minutes_to_merge_copilot_reviewed": 2.5
}
```

### 2.5 CLI / Token Usage (inside `day_totals`)

```json
{
  "prompt_count": 3,
  "request_count": 3,
  "session_count": 3,
  "token_usage": {
    "avg_tokens_per_request": 4100.0,
    "output_tokens_sum": 7000,
    "prompt_tokens_sum": 5300
  }
}
```

### 2.6 User-Teams Document Schema (join table)

```json
[
  {
    "user_id": 1001,
    "user_login": "octocat",
    "day": "2026-05-14",
    "enterprise_id": "1",
    "team_id": 9001,
    "slug": "eng-platform"
  }
]
```

Teams with fewer than 5 seated Copilot users are **omitted** from this report.

---

## 3. Schema Comparison: v1 vs New API

| Concept           | v1 API                                                                        | New API                                                                                       |
| ----------------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Delivery          | JSON inline in REST response                                                  | Signed URL → download JSON document                                                           |
| Aggregation level | Enterprise or org totals                                                      | Enterprise or org totals **and** per-user                                                     |
| Team data         | Direct team-level API calls (GraphQL enumeration)                             | Separate user-teams join document                                                             |
| Code metrics      | `suggestions_count`, `acceptances_count`, `lines_suggested`, `lines_accepted` | `loc_suggested_to_add_sum`, `loc_added_sum`, `loc_suggested_to_delete_sum`, `loc_deleted_sum` |
| Activity metrics  | `total_active_users`, `total_engaged_users`                                   | `daily_active_users`, `weekly_active_users`, `monthly_active_users`                           |
| PR metrics        | None                                                                          | Full PR telemetry incl. copilot-authored / reviewed                                           |
| CLI / token usage | None                                                                          | `prompt_count`, `request_count`, `token_usage`                                                |
| Feature breakdown | Via nested structure (editors → models → languages)                           | Flat `totals_by_feature`, `totals_by_ide`, `totals_by_language_feature`                       |
| Chat              | `total_chat_acceptances`, `total_chat_turns` (nested)                         | `user_initiated_interaction_count`, `used_chat` per user                                      |
| Seat data         | Separate seats endpoint                                                       | Not in metrics report; keep existing seat logic if still available                            |
| Data history      | Live API only                                                                 | Up to 1 year; from Oct 10, 2025                                                               |

---

## 4. Replacement Architecture

### 4.1 Guiding Principles

1. **Replace, don't duplicate** — New files replace the old ones directly. No parallel classes alongside dead originals.
2. **Parse and store** — Download report documents and normalise them into relational tables. Do not query signed URLs at request time (they expire).
3. **No forced mapping** — New DB schema reflects the new API's shape directly; no lossy conversion to old columns.
4. **Team-level via join** — Team metrics are computed by joining `copilot_user_metrics` with `copilot_user_teams`, not via separate API calls.
5. **Replace dead tasks** — The four old ingestion sub-tasks called a now-dead API. `TaskManagement.ts` is replaced in its entirety.
6. **Incremental by default** — The ingestion log is the single source of truth for what has been loaded. Every run (scheduled or manual) fills only missing or failed days — never re-downloads data that already exists.
7. **Configurable backfill** — Operators set a `backfillFromDate` (≥ `2025-10-10`) and the task walks forward from that date to yesterday on first run. This can fully replace the legacy historical dataset.
8. **Preserve legacy read path** — Existing legacy endpoints are moved to a `/legacy` prefix. Once a full backfill is confirmed these can be removed.

### 4.2 Database Schema

All new tables share a `(day, metrics_type, entity_id)` base key.
`metrics_type` is `'enterprise'` or `'organization'`.
`entity_id` is the enterprise slug or organisation name.

#### Migration file: `202506XXXXXX_add_metrics_tables.js`

**`copilot_daily_totals`** — Aggregate metrics per day per entity

| Column                             | Type                                        | Notes                              |
| ---------------------------------- | ------------------------------------------- | ---------------------------------- |
| `id`                               | serial PK                                   |                                    |
| `day`                              | date NOT NULL                               |                                    |
| `metrics_type`                     | varchar NOT NULL                            | `'enterprise'` or `'organization'` |
| `entity_id`                        | varchar NOT NULL                            | enterprise slug or org name        |
| `team_slug`                        | varchar NOT NULL DEFAULT `''`               | `''` = overall (no team filter)    |
| `daily_active_users`               | integer                                     |                                    |
| `weekly_active_users`              | integer                                     |                                    |
| `monthly_active_users`             | integer                                     |                                    |
| `daily_active_cli_users`           | integer                                     |                                    |
| `monthly_active_agent_users`       | integer                                     |                                    |
| `monthly_active_chat_users`        | integer                                     |                                    |
| `code_acceptance_activity_count`   | integer                                     |                                    |
| `code_generation_activity_count`   | integer                                     |                                    |
| `loc_added_sum`                    | integer                                     |                                    |
| `loc_deleted_sum`                  | integer                                     |                                    |
| `loc_suggested_to_add_sum`         | integer                                     |                                    |
| `loc_suggested_to_delete_sum`      | integer                                     |                                    |
| `user_initiated_interaction_count` | integer                                     |                                    |
| UNIQUE                             | `(day, metrics_type, entity_id, team_slug)` |                                    |

**`copilot_pr_metrics`** — Pull request telemetry per day per entity

| Column                                     | Type                                        |
| ------------------------------------------ | ------------------------------------------- |
| `id`                                       | serial PK                                   |
| `day`                                      | date NOT NULL                               |
| `metrics_type`                             | varchar NOT NULL                            |
| `entity_id`                                | varchar NOT NULL                            |
| `team_slug`                                | varchar NOT NULL DEFAULT `''`               |
| `total_created`                            | integer                                     |
| `total_merged`                             | integer                                     |
| `total_reviewed`                           | integer                                     |
| `total_created_by_copilot`                 | integer                                     |
| `total_merged_created_by_copilot`          | integer                                     |
| `total_merged_reviewed_by_copilot`         | integer                                     |
| `total_reviewed_by_copilot`                | integer                                     |
| `total_suggestions`                        | integer                                     |
| `total_applied_suggestions`                | integer                                     |
| `total_copilot_suggestions`                | integer                                     |
| `total_copilot_applied_suggestions`        | integer                                     |
| `median_minutes_to_merge`                  | float                                       |
| `median_minutes_to_merge_copilot_authored` | float                                       |
| `median_minutes_to_merge_copilot_reviewed` | float                                       |
| UNIQUE                                     | `(day, metrics_type, entity_id, team_slug)` |

**`copilot_metrics_by_feature`** — Feature breakdown per day

| Column                             | Type                                                 |
| ---------------------------------- | ---------------------------------------------------- | ---------------------------------- |
| `id`                               | serial PK                                            |
| `day`                              | date NOT NULL                                        |
| `metrics_type`                     | varchar NOT NULL                                     |
| `entity_id`                        | varchar NOT NULL                                     |
| `team_slug`                        | varchar NOT NULL DEFAULT `''`                        |
| `feature`                          | varchar NOT NULL                                     | e.g. `'code_completion'`, `'chat'` |
| `code_acceptance_activity_count`   | integer                                              |
| `code_generation_activity_count`   | integer                                              |
| `loc_added_sum`                    | integer                                              |
| `loc_deleted_sum`                  | integer                                              |
| `loc_suggested_to_add_sum`         | integer                                              |
| `loc_suggested_to_delete_sum`      | integer                                              |
| `user_initiated_interaction_count` | integer                                              |
| UNIQUE                             | `(day, metrics_type, entity_id, team_slug, feature)` |

**`copilot_metrics_by_ide`** — IDE breakdown per day

| Column                                                                                           | Type                                             |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------ | ------------------------------ |
| `id`                                                                                             | serial PK                                        |
| `day` / `metrics_type` / `entity_id` / `team_slug`                                               | as above                                         |
| `ide`                                                                                            | varchar NOT NULL                                 | e.g. `'vscode'`, `'jetbrains'` |
| `code_acceptance_activity_count`                                                                 | integer                                          |
| `code_generation_activity_count`                                                                 | integer                                          |
| `loc_added_sum` / `loc_deleted_sum` / `loc_suggested_to_add_sum` / `loc_suggested_to_delete_sum` | integer                                          |
| `user_initiated_interaction_count`                                                               | integer                                          |
| UNIQUE                                                                                           | `(day, metrics_type, entity_id, team_slug, ide)` |

**`copilot_metrics_by_language_feature`** — Language + feature breakdown per day

| Column                                                                                           | Type                                                           |
| ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------- |
| `id`                                                                                             | serial PK                                                      |
| `day` / `metrics_type` / `entity_id` / `team_slug`                                               | as above                                                       |
| `language`                                                                                       | varchar NOT NULL                                               |
| `feature`                                                                                        | varchar NOT NULL                                               |
| `code_acceptance_activity_count` / `code_generation_activity_count`                              | integer                                                        |
| `loc_added_sum` / `loc_deleted_sum` / `loc_suggested_to_add_sum` / `loc_suggested_to_delete_sum` | integer                                                        |
| UNIQUE                                                                                           | `(day, metrics_type, entity_id, team_slug, language, feature)` |

**`copilot_user_metrics`** — Per-user daily metrics

| Column                                                                                           | Type                                      |
| ------------------------------------------------------------------------------------------------ | ----------------------------------------- |
| `id`                                                                                             | serial PK                                 |
| `day`                                                                                            | date NOT NULL                             |
| `metrics_type`                                                                                   | varchar NOT NULL                          |
| `entity_id`                                                                                      | varchar NOT NULL                          |
| `user_id`                                                                                        | bigint NOT NULL                           |
| `user_login`                                                                                     | varchar NOT NULL                          |
| `used_agent`                                                                                     | boolean                                   |
| `used_chat`                                                                                      | boolean                                   |
| `used_cli`                                                                                       | boolean                                   |
| `code_acceptance_activity_count`                                                                 | integer                                   |
| `code_generation_activity_count`                                                                 | integer                                   |
| `loc_added_sum` / `loc_deleted_sum` / `loc_suggested_to_add_sum` / `loc_suggested_to_delete_sum` | integer                                   |
| `user_initiated_interaction_count`                                                               | integer                                   |
| UNIQUE                                                                                           | `(day, metrics_type, entity_id, user_id)` |

**`copilot_user_teams`** — User → team membership snapshot per day (join table)

| Column         | Type                                               |
| -------------- | -------------------------------------------------- |
| `id`           | serial PK                                          |
| `day`          | date NOT NULL                                      |
| `metrics_type` | varchar NOT NULL                                   |
| `entity_id`    | varchar NOT NULL                                   |
| `user_id`      | bigint NOT NULL                                    |
| `user_login`   | varchar NOT NULL                                   |
| `team_id`      | bigint NOT NULL                                    |
| `team_slug`    | varchar NOT NULL                                   |
| UNIQUE         | `(day, metrics_type, entity_id, user_id, team_id)` |

**`copilot_ingestion_log`** — Idempotency and backfill state tracking

This table is the authoritative record of what has been loaded. Every ingestion run
(scheduled or manual backfill) consults it to determine which days are missing or
failed, then writes a row per day processed.

| Column              | Type                                   | Notes                                                                |
| ------------------- | -------------------------------------- | -------------------------------------------------------------------- |
| `id`                | serial PK                              |                                                                      |
| `day`               | date NOT NULL                          |                                                                      |
| `metrics_type`      | varchar NOT NULL                       | `'enterprise'` or `'organization'`                                   |
| `entity_id`         | varchar NOT NULL                       | enterprise slug or org name                                          |
| `ingested_at`       | timestamptz NOT NULL DEFAULT now()     |                                                                      |
| `status`            | varchar NOT NULL                       | `'success'`, `'error'`, `'partial'`                                  |
| `components_loaded` | varchar[] NOT NULL DEFAULT `'{}'`      | e.g. `'{totals,users,teams}'` — tracks which sub-documents succeeded |
| `error_message`     | text nullable                          |                                                                      |
| `source`            | varchar NOT NULL DEFAULT `'scheduled'` | `'scheduled'`, `'backfill'`, `'manual'`                              |
| UNIQUE              | `(day, metrics_type, entity_id)`       | On conflict: update status + ingested_at                             |

### 4.3 Backend Architecture

#### GitHub API Client (`GithubClient.ts`)

Replaces the existing `GithubClient.ts` entirely:

```
fetchEnterpriseReportLinks(enterprise, day) → string[]     // enterprise-1-day
fetchOrganizationReportLinks(org, day)   → string[]         // organization-1-day
fetchEnterpriseUserReportLinks(enterprise, day) → string[]  // users-1-day
fetchOrganizationUserReportLinks(org, day) → string[]       // users-1-day (org)
fetchEnterpriseUserTeamsLinks(enterprise, day) → string[]   // user-teams-1-day
fetchOrganizationUserTeamsLinks(org, day) → string[]        // user-teams-1-day (org)
downloadDocument(url) → unknown                             // generic signed URL fetch
```

All methods use the `X-GitHub-Api-Version: 2026-03-10` header.
Auth reuses `GithubUtils.ts` credential resolution (token or GitHub App).

#### Database Handler (`DatabaseHandler.ts`)

Replaces the existing `DatabaseHandler.ts` entirely.

```
// Inserts (all idempotent via onConflict().ignore())
insertDailyTotals(rows[])
insertPrMetrics(rows[])
insertByFeature(rows[])
insertByIde(rows[])
insertByLanguageFeature(rows[])
insertUserMetrics(rows[])
insertUserTeams(rows[])
logIngestion(day, metricsType, entityId, status, errorMessage?)

// Queries
getDailyTotals(metricsType, entityId, from, to, teamSlug?) → DailyTotal[]
getPrMetrics(metricsType, entityId, from, to, teamSlug?) → PrMetrics[]
getByFeature(metricsType, entityId, from, to, teamSlug?) → MetricsByFeature[]
getByIde(metricsType, entityId, from, to, teamSlug?) → MetricsByIde[]
getByLanguageFeature(metricsType, entityId, from, to, teamSlug?) → MetricsByLanguageFeature[]
getUserMetrics(metricsType, entityId, from, to, teamSlug?) → UserMetric[]
getTeams(metricsType, entityId, from, to) → string[]
getPeriodRange(metricsType, entityId) → PeriodRange
getLastIngestedDay(metricsType, entityId) → string | null
```

Team-level daily totals are computed by joining `copilot_user_metrics` with
`copilot_user_teams` and aggregating — no pre-computed team rows are required
in `copilot_daily_totals`. However, for performance, the ingestion task should
materialise team aggregates into `copilot_daily_totals` (with `team_slug` set)
during ingestion.

#### Ingestion Task (`TaskManagement.ts`)

Replaces the existing `TaskManagement.ts` entirely. Runs on the **same 2 AM UTC schedule** (configurable).

##### Incremental loading algorithm

For each configured entity (enterprise and/or organisation):

1. Read `backfillFromDate` from config (default `'2025-10-10'`, the earliest available day).
2. Query `copilot_ingestion_log` for all days with `status = 'success'` in the range `[backfillFromDate, yesterday]`.
3. Compute the **missing days list**: every calendar day in that range that does not have a successful log entry. This covers both the initial backfill and any gaps caused by failures or new configuration.
4. If the missing list is empty, the task exits immediately — nothing to do.
5. For each missing day in chronological order:
   a. Fetch `enterprise-1-day` (or `organization-1-day`) links → download documents → parse → insert `copilot_daily_totals`, `copilot_pr_metrics`, `copilot_metrics_by_feature`, `copilot_metrics_by_ide`, `copilot_metrics_by_language_feature`.
   b. (If `ingestUsers: true`) Fetch `users-1-day` links → download → parse → insert `copilot_user_metrics`.
   c. Fetch `user-teams-1-day` links → download → parse → insert `copilot_user_teams`.
   d. Compute and materialise team-level aggregates by joining user metrics × user-teams; insert into breakdown tables with `team_slug` populated.
   e. Upsert a `status = 'success'` row into `copilot_ingestion_log` with `components_loaded` populated.
   f. If any step fails: upsert `status = 'error'` with the error message; **continue** to the next day.
   g. Wait `backfillDelayMs` milliseconds before the next day (default 200 ms) to avoid GitHub API rate limits.

> **First run behaviour**: On a fresh deployment with no log entries the missing days list
> spans from `backfillFromDate` to yesterday — potentially ~7 months of data on initial
> setup. With a 200 ms delay per day that is roughly 45 seconds for the full initial backfill.
> The Backstage task timeout should be set generously (e.g. 30 minutes) for the first run.

> **Idempotency**: Because inserts use `onConflict().ignore()` and the log uses
> `onConflict().merge()`, re-running the task for the same day is always safe.

> **Replacing legacy historical data**: Once the backfill reaches `2025-10-10` and runs
> forward to the present day, the new tables contain data covering the same period as the
> old DB. At that point the legacy frontend view is redundant for all data ≥ Oct 2025.
> Data prior to Oct 2025 that exists only in the old tables can still be served by the
> legacy read path, but this period predates the plugin's likely deployment so may be empty.

##### Manual backfill endpoint

The router also exposes a `POST /backfill` endpoint (see §4.3) that allows an
operator to trigger an ad-hoc backfill from a specific date without waiting for the
next scheduler run.

#### Router (`router.ts`)

Replaces the existing `router.ts`. Legacy endpoints are moved to a `/legacy` prefix
(see §6); all new endpoints are at the root level.

| Method | Path                     | Query params                                          | Description                                     |
| ------ | ------------------------ | ----------------------------------------------------- | ----------------------------------------------- |
| GET    | `/health`                | —                                                     | Health check                                    |
| GET    | `/metrics/daily`         | `type`, `entityId`, `from`, `to`, `team?`             | Daily active user / LOC metrics                 |
| GET    | `/metrics/pull-requests` | `type`, `entityId`, `from`, `to`, `team?`             | PR telemetry                                    |
| GET    | `/metrics/by-feature`    | `type`, `entityId`, `from`, `to`, `team?`             | Feature breakdown                               |
| GET    | `/metrics/by-ide`        | `type`, `entityId`, `from`, `to`, `team?`             | IDE breakdown                                   |
| GET    | `/metrics/by-language`   | `type`, `entityId`, `from`, `to`, `feature?`, `team?` | Language breakdown                              |
| GET    | `/users`                 | `type`, `entityId`, `from`, `to`, `team?`             | Per-user metrics                                |
| GET    | `/teams`                 | `type`, `entityId`, `from?`, `to?`                    | Available team slugs                            |
| GET    | `/metrics/period-range`  | `type`, `entityId`                                    | Earliest–latest successfully ingested dates     |
| GET    | `/backfill/status`       | `type`, `entityId`, `from?`, `to?`                    | Ingestion log — which days loaded, which failed |
| POST   | `/backfill`              | body: `{ type, entityId, fromDate, toDate? }`         | Trigger ad-hoc backfill for a date range        |
| GET    | `/legacy/metrics`        | (existing params)                                     | Legacy data from old schema                     |
| GET    | `/legacy/engagements`    | (existing params)                                     | Legacy engagement data                          |
| GET    | `/legacy/seats`          | (existing params)                                     | Legacy seat data                                |

The `POST /backfill` endpoint enqueues the backfill as a Backstage task (or runs
synchronously for small ranges) and returns a `202 Accepted` with a job identifier.
It requires an `Authorization` header and should only be accessible to admins (enforced
via Backstage permission framework).

### 4.4 Common Types (copilot-common)

Replace existing type definitions. Old types (`CopilotMetrics`, `EngagementMetrics`, etc.)
are removed; these new types become the package's public surface.

```typescript
// GitHub API response types
export interface ReportEnvelope {
  download_links: string[];
  report_day?: string;
  report_start_day?: string;
  report_end_day?: string;
}

export interface EnterpriseDayTotal {
  day: string;
  enterprise_id: string;
  daily_active_users: number;
  weekly_active_users: number;
  monthly_active_users: number;
  daily_active_cli_users?: number;
  monthly_active_agent_users?: number;
  monthly_active_chat_users?: number;
  code_acceptance_activity_count: number;
  code_generation_activity_count: number;
  loc_added_sum: number;
  loc_deleted_sum: number;
  loc_suggested_to_add_sum: number;
  loc_suggested_to_delete_sum: number;
  user_initiated_interaction_count: number;
  pull_requests?: PrMetrics;
  totals_by_cli?: CliTotals;
  totals_by_feature?: MetricsByFeature[];
  totals_by_ide?: MetricsByIde[];
  totals_by_language_feature?: MetricsByLanguageFeature[];
  totals_by_language_model?: MetricsByLanguageModel[];
  totals_by_model_feature?: MetricsByModelFeature[];
}

export interface EnterpriseDocument {
  enterprise_id: string;
  report_start_day: string;
  report_end_day: string;
  day_totals: EnterpriseDayTotal[];
}

export interface PrMetrics {
  total_created: number;
  total_merged: number;
  total_reviewed: number;
  total_created_by_copilot: number;
  total_merged_created_by_copilot: number;
  total_merged_reviewed_by_copilot: number;
  total_reviewed_by_copilot: number;
  total_suggestions: number;
  total_applied_suggestions: number;
  total_copilot_suggestions: number;
  total_copilot_applied_suggestions: number;
  median_minutes_to_merge?: number;
  median_minutes_to_merge_copilot_authored?: number;
  median_minutes_to_merge_copilot_reviewed?: number;
}

export interface MetricsByFeature {
  feature: string;
  code_acceptance_activity_count: number;
  code_generation_activity_count: number;
  loc_added_sum: number;
  loc_deleted_sum: number;
  loc_suggested_to_add_sum: number;
  loc_suggested_to_delete_sum: number;
  user_initiated_interaction_count?: number;
}

export interface MetricsByIde {
  ide: string;
  code_acceptance_activity_count: number;
  code_generation_activity_count: number;
  loc_added_sum: number;
  loc_deleted_sum: number;
  loc_suggested_to_add_sum: number;
  loc_suggested_to_delete_sum: number;
  user_initiated_interaction_count?: number;
}

export interface MetricsByLanguageFeature {
  language: string;
  feature: string;
  code_acceptance_activity_count: number;
  code_generation_activity_count: number;
  loc_added_sum: number;
  loc_deleted_sum: number;
  loc_suggested_to_add_sum: number;
  loc_suggested_to_delete_sum: number;
}

export interface CliTotals {
  prompt_count: number;
  request_count: number;
  session_count: number;
  token_usage?: {
    avg_tokens_per_request: number;
    output_tokens_sum: number;
    prompt_tokens_sum: number;
  };
}

export interface UserMetric {
  user_id: number;
  user_login: string;
  day: string;
  enterprise_id?: string;
  organization_id?: string;
  used_agent: boolean;
  used_chat: boolean;
  used_cli: boolean;
  code_acceptance_activity_count: number;
  code_generation_activity_count: number;
  loc_added_sum: number;
  loc_deleted_sum: number;
  loc_suggested_to_add_sum: number;
  loc_suggested_to_delete_sum: number;
  user_initiated_interaction_count: number;
  totals_by_feature?: MetricsByFeature[];
  totals_by_ide?: MetricsByIde[];
  totals_by_language_feature?: MetricsByLanguageFeature[];
}

export interface UserTeam {
  user_id: number;
  user_login: string;
  day: string;
  enterprise_id?: string;
  organization_id?: string;
  team_id: number;
  slug: string;
}
```

### 4.5 Frontend Architecture

#### API Interface (`CopilotApi.ts`)

Replaces the existing `CopilotApi.ts` entirely.

```typescript
export interface CopilotApi {
  getDailyMetrics(params: MetricsParams): Promise<DailyTotal[]>;
  getPrMetrics(params: MetricsParams): Promise<PrMetrics[]>;
  getByFeature(params: MetricsParams): Promise<MetricsByFeature[]>;
  getByIde(params: MetricsParams): Promise<MetricsByIde[]>;
  getByLanguage(
    params: MetricsParams & { feature?: string },
  ): Promise<MetricsByLanguageFeature[]>;
  getUsers(params: MetricsParams): Promise<UserMetric[]>;
  getTeams(params: Pick<MetricsParams, 'type' | 'entityId'>): Promise<string[]>;
  getPeriodRange(
    params: Pick<MetricsParams, 'type' | 'entityId'>,
  ): Promise<PeriodRange>;
}

interface MetricsParams {
  type: 'enterprise' | 'organization';
  entityId: string;
  from: Date;
  to: Date;
  team?: string;
}
```

#### Pages & Components

All existing pages and components under `components/` are replaced. The `legacy/`
subfolder retains the old components, kept only while `showLegacyView` is enabled.

```
plugins/copilot/src/
  components/
    CopilotPage.tsx              ← Root page; default route
    EnterprisePage.tsx           ← Enterprise dashboard
    OrganizationPage.tsx         ← Organisation dashboard
    dashboard/
      DashboardLayout.tsx        ← Shared layout with date/team filters
      SummaryCards.tsx           ← DAU, MAU, LOC added, acceptance rate
      PRMetricsCard.tsx          ← PR telemetry panel
      FeatureBreakdownChart.tsx  ← Bar/pie by feature
      IDEBreakdownChart.tsx      ← Bar by IDE
      LanguageBreakdownChart.tsx ← Table/chart by language
      UserActivityTable.tsx      ← Per-user metrics table (opt-in)
    filters/
      DateRangePicker.tsx        ← Retained from existing implementation
      TeamSelector.tsx           ← Retained from existing implementation
    legacy/
      LegacyCopilotPage.tsx      ← Old dashboard (shown only if showLegacyView: true)
```

#### Navigation changes

- `CopilotPage` is the default route (`/copilot`).
- `LegacyCopilotPage` is mounted at `/copilot/legacy` but **only rendered** when
  `showLegacyView: true` is set in config, or when `backfillFromDate` is later than
  `2025-10-10` (meaning there is a known gap in coverage).
- `CopilotPage` shows a contextual banner:
  - **During backfill**: _"Loading historical data — earliest coverage: {earliestDay}."_
  - **Gap present** (legacy enabled): _"Data from before {earliestDay} is available in the [Legacy View]."_
  - **Fully loaded, no gap**: no banner shown.

#### Key visualisations

| Component                | What it shows                                                                                                           |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| `SummaryCards`           | DAU / WAU / MAU trend; LOC added vs suggested (acceptance rate); code generation vs acceptance counts                   |
| `PRMetricsCard`          | PRs created/merged/reviewed; Copilot-authored/reviewed %; median time to merge comparison                               |
| `FeatureBreakdownChart`  | Stacked bar: acceptance counts by feature (code_completion, chat, agent, cli)                                           |
| `IDEBreakdownChart`      | Pie/bar: LOC added split by IDE                                                                                         |
| `LanguageBreakdownChart` | Table sorted by LOC accepted; filter by feature                                                                         |
| `UserActivityTable`      | Optional table: user_login, used_chat, used_agent, used_cli, LOC added (requires explicit opt-in in config for privacy) |

---

## 5. Configuration Changes

> **Breaking change.** This release replaces the existing plugin config entirely.
> The old `schedule` key and all previous ingestion settings are removed.
> Existing installations must update their `app-config.yaml` before upgrading.

### copilot-backend `config.d.ts`

The `v2` sub-key is gone. All settings live directly under `copilot`.

```typescript
copilot?: {
  /** Slug of the GitHub Enterprise to ingest metrics for. */
  enterprise?: string;
  /** Name of the GitHub Organisation to ingest metrics for. */
  organization?: string;
  /** GitHub host — defaults to 'github.com'. */
  host?: string;
  /**
   * Earliest date to ingest. Must be >= '2025-10-10' (GitHub API limit).
   * On first run the task backfills every calendar day from this date to yesterday.
   * Default: '2025-10-10'
   */
  backfillFromDate?: string;    // YYYY-MM-DD
  /**
   * Milliseconds to wait between per-day requests during backfill.
   * Increase if you encounter GitHub API rate limits.
   * Default: 200
   */
  backfillDelayMs?: number;
  /**
   * Opt-in to ingesting per-user metrics (users-1-day reports).
   * Increases storage and ingestion time. Privacy implications — see §9.
   * Default: false
   */
  ingestUsers?: boolean;
  schedule?: {
    frequency?: HumanDuration;    // default: { hours: 24 }
    timeout?: HumanDuration;      // default: { minutes: 30 } — sized for initial backfill
    initialDelay?: HumanDuration;
  };
};
```

Example `app-config.yaml` snippet:

```yaml
copilot:
  enterprise: my-enterprise
  backfillFromDate: '2025-10-10' # load all available history
  backfillDelayMs: 300
  ingestUsers: false
  schedule:
    frequency: { hours: 24 }
    timeout: { minutes: 30 }
    initialDelay: { seconds: 30 }
```

### copilot frontend `config.d.ts`

```typescript
copilot?: {
  /** Slug of the GitHub Enterprise. */
  enterprise?: string;
  /** Name of the GitHub Organisation. */
  organization?: string;
  /**
   * Show the per-user metrics table in the dashboard.
   * Only meaningful when ingestUsers is enabled on the backend.
   * Default: false
   */
  showUserMetrics?: boolean;
  /**
   * Show the legacy (pre-October 2025) view link.
   * Enable only if your backfillFromDate is later than '2025-10-10'
   * and you have pre-backfill data in the old tables you wish to expose.
   * Default: false
   */
  showLegacyView?: boolean;
  /** Which scope to default to on the dashboard. Default: 'enterprise' if set, else 'organization'. */
  defaultView?: 'enterprise' | 'organization';
};
```

---

## 6. What to Disable / Replace

| Old item                                                   | Action                                                                                                                                          |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `TaskManagement.ts` — 4 sub-tasks calling old API          | **Disable** — old endpoints return 404. Keep file for reference until Phase 6 cleanup                                                           |
| `GithubClient.ts` — `fetchMetrics()`, `fetchTeamMetrics()` | **Keep for now** — still used by v1 read path. Once backfill is confirmed complete these can be removed                                         |
| `GET /metrics` v1 endpoint                                 | **Keep** — serves any data pre-Oct 2025 in the v1 DB. Can be deprecated once backfill covers the full v1 date range                             |
| `GET /engagements` v1 endpoint                             | **Keep** (same as above)                                                                                                                        |
| `GET /seats` v1 endpoint                                   | **Evaluate** — if the GitHub seats API still exists, wire a new seats client; otherwise serve from cached DB only                               |
| Old `schedule` and all previous config keys                | **Removed** — breaking change; operators must update `app-config.yaml` (see §5)                                                                 |
| Legacy frontend route `/copilot/legacy`                    | **Keep but hide by default** — surface it only if `showLegacyView: true` is set in config or if `backfillFromDate` is later than `'2025-10-10'` |

---

## 7. Phased Implementation Plan

### Phase 1 — Foundation (copilot-common + client)

**Goal**: New types and API client, no DB changes yet.

- [ ] Replace type definitions in `copilot-common/src/index.ts` (remove old types, add new)
  - `ReportEnvelope`, `EnterpriseDocument`, `EnterpriseDayTotal`
  - `PrMetrics`, `MetricsByFeature`, `MetricsByIde`, `MetricsByLanguageFeature`, `CliTotals`
  - `UserMetric`, `UserTeam`
  - `DailyTotalDb` (DB row type), `PrMetricsDb`, `MetricsByFeatureDb`, etc.
- [ ] Replace `plugins/copilot-backend/src/client/GithubClient.ts`
  - Methods to fetch report envelope (get download_links) per report type
  - Generic `downloadDocument(url)` method (no auth, signed URL)
  - Reuse `GithubUtils.ts` for auth credentials and host resolution
- [ ] Unit tests for `GithubClient.ts` (mock HTTP)
- [ ] Export new types from `copilot-common` package

### Phase 2 — Database Migration & Handler

**Goal**: New tables in DB, query layer.

- [ ] Create migration `plugins/copilot-backend/migrations/202506XXXXXX_add_metrics_tables.js`
  - Create all 8 new tables described in §4.2
  - Include `down()` to drop them
- [ ] Replace `plugins/copilot-backend/src/db/DatabaseHandler.ts`
  - All insert methods (idempotent via `onConflict().ignore()`)
  - All query methods with date range and optional team filter
  - `getMissingDays(metricsType, entityId, from, to)` — returns calendar days absent from log or with `status = 'error'`
  - `upsertIngestionLog(row)` — insert or update a log row by `(day, metrics_type, entity_id)`
  - `getIngestionLog(metricsType, entityId, from?, to?)` — for the backfill status endpoint
- [ ] Unit tests for `DatabaseHandler.ts` (sqlite in-memory via existing test setup):
  - `getMissingDays`: gaps correctly identified, successful days skipped, error days re-queued
- [ ] Migration tests in `src/migrations-test/`

### Phase 3 — Ingestion Task

**Goal**: Daily data collection from the new API.

- [ ] Replace `plugins/copilot-backend/src/task/TaskManagement.ts`
  - Reads config: `enterprise`, `organization`, `schedule`, `ingestUsers`, `backfillFromDate`, `backfillDelayMs`
  - Calls `DatabaseHandler.getMissingDays(metricsType, entityId, backfillFromDate, yesterday)` to get the full gap list
  - Iterates missing days chronologically, executing per-day download pipeline (see §4.3)
  - Respects `backfillDelayMs` between days
  - Upserts ingestion log rows (success / error) per day
  - Exports a `runBackfill(fromDate, toDate, entityConfig)` function reused by the manual endpoint
- [ ] Create `plugins/copilot-backend/src/utils/reportParser.ts`
  - `parseEnterpriseDocument(doc) → { dailyTotals[], prMetrics[], byFeature[], byIde[], byLanguageFeature[] }`
  - `parseUserDocument(doc) → UserMetricDb[]`
  - `parseUserTeamsDocument(doc) → UserTeamDb[]`
  - Input validation: reject/log malformed documents without crashing
- [ ] Create `plugins/copilot-backend/src/utils/teamAggregator.ts`
  - `aggregateTeamMetrics(userMetrics, userTeams, day, metricsType, entityId) → { dailyTotals[], byFeature[], byIde[], byLanguageFeature[] }`
- [ ] Add `POST /backfill` and `GET /backfill/status` to `router.ts`
  - `POST /backfill`: validates `fromDate` ≥ `2025-10-10`, rejects future `toDate`, calls `runBackfill()`, returns 202
  - `GET /backfill/status`: returns rows from `copilot_ingestion_log` for the queried range
- [ ] Register `TaskManagement` in `plugins/copilot-backend/src/plugin.ts`
  - Remove old task registration
- [ ] Integration tests:
  - Full pipeline for a single day (mock client + sqlite)
  - Multi-day backfill covering a gap (some days pre-populated, some not)
  - Error recovery: one day fails, subsequent days still process
  - Idempotency: re-running the same day range does not duplicate rows

### Phase 4 — Backend API

**Goal**: Replace the existing router with new REST endpoints.

- [ ] Replace `plugins/copilot-backend/src/service/router.ts`
  - All endpoints listed in §4.3 (new endpoints at root level, legacy at `/legacy/*`)
  - Input validation (date format, valid metric types)
  - Inject `DatabaseHandler` via plugin context
- [ ] Update `report.api.md` with new endpoint surface
- [ ] API integration tests

### Phase 5 — Frontend

**Goal**: Replace the existing dashboard with the new implementation; preserve legacy view.

- [ ] Replace `CopilotApi` interface in `plugins/copilot/src/api/`
- [ ] Replace `CopilotApiClient` implementation using Backstage `DiscoveryApi`
- [ ] Re-register `CopilotApi` in `plugin.ts` API factory
- [ ] Replace `CopilotPage`, `EnterprisePage`, `OrganizationPage`
- [ ] Create new dashboard components (§4.5):
  - `SummaryCards`
  - `PRMetricsCard`
  - `FeatureBreakdownChart`
  - `IDEBreakdownChart`
  - `LanguageBreakdownChart`
  - `UserActivityTable` (hidden behind `showUserMetrics` config)
  - Retain existing `TeamSelector` and `DateRangePicker`
- [ ] Move old dashboard into `components/legacy/LegacyCopilotPage.tsx`
- [ ] Update `routes.ts`:
  - `/copilot` → `CopilotPage` (default)
  - `/copilot/legacy` → `LegacyCopilotPage` (rendered only if `showLegacyView: true` or `backfillFromDate` is later than `'2025-10-10'`)
- [ ] Add informational banner to `CopilotPage`:
  - While backfill is in progress: _"Loading historical data — coverage from {earliestDay} to present."_ (poll `/metrics/period-range`)
  - If legacy view enabled: _"Data from before {earliestDay} is available in the [Legacy View]."_
  - Once fully loaded: no banner
- [ ] Update `App.tsx` / plugin route registration
- [ ] Frontend unit tests for new components
- [ ] Update `dev/MockCopilotApi.ts` with new mock data

### Phase 6 — Cleanup & Documentation

- [ ] Update `README.md` for both plugins with new instructions and backfill guidance
- [ ] Update `config.d.ts` files for backend and frontend with the new flat config shape (see §5)
- [ ] Add migration guide to `README.md`: document the removed config keys and their replacements
- [ ] Add config examples to `app-config.yaml`
- [ ] Document when the legacy view is and isn’t needed (i.e. `backfillFromDate: '2025-10-10'` makes it optional)
- [ ] Update `CHANGELOG.md` for all three packages
- [ ] Validate with a real GitHub enterprise/org token in dev environment:
  - Confirm backfill completes for full range
  - Verify `/backfill/status` shows all days as `success`
  - Verify dashboard date range covers from Oct 2025 to present
- [ ] Add deprecation notice on legacy read endpoints

---

## 8. Testing Strategy

| Layer                           | Approach                                                                                   |
| ------------------------------- | ------------------------------------------------------------------------------------------ |
| GitHub API Client               | Mock HTTP responses with sample report envelopes and document JSON                         |
| Report parsers                  | Pure unit tests with sample documents from §2.2–§2.6                                       |
| Database Handler                | Sqlite in-memory; test `getMissingDays()` with various log states                          |
| Ingestion task — single day     | Integration test: mock client + sqlite, verify all tables populated                        |
| Ingestion task — backfill       | Integration test: pre-seed log with some successful days; verify only missing days fetched |
| Ingestion task — error recovery | Inject failure on day N; verify day N logged as error and day N+1 still processes          |
| Ingestion task — idempotency    | Run same range twice; verify row counts unchanged                                          |
| Backfill endpoint               | Supertest POST `/backfill`; verify 202 + log entries created                               |
| Backfill status endpoint        | Supertest GET `/backfill/status`; verify log rows returned                                 |
| Router                          | Supertest with mock DB handler                                                             |
| Frontend components             | React Testing Library; mock `CopilotApi`                                                   |
| Frontend backfill banner        | Test banner shows/hides based on `period-range` response                                   |

---

## 9. Risk & Considerations

| Risk                             | Mitigation                                                                                                                                                                                                |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Signed URLs expire quickly       | Download immediately after fetching envelope response; do not cache or defer                                                                                                                              |
| Large documents (many users)     | Chunk downloads; insert in batches using existing `batchInsert.ts`                                                                                                                                        |
| Rate limits on report endpoint   | `backfillDelayMs` (default 200 ms) between days; increase if 429s appear; backfill re-runs automatically via the gap-fill algorithm                                                                       |
| Initial backfill duration        | ~7 months × ~200 ms ≈ 45 seconds; Backstage task timeout set to 30 minutes to be safe                                                                                                                     |
| User-level data privacy          | `ingestUsers` defaults to `false`; `showUserMetrics` defaults to `false`; document data handling                                                                                                          |
| Teams with < 5 users omitted     | Documented API behaviour; surface this caveat in UI tooltip                                                                                                                                               |
| Historical gap (pre-Oct 2025)    | New tables start Oct 10, 2025. Any old DB data before that date remains accessible via `/legacy/*` endpoints. Most deployments will have no pre-Oct 2025 data so the legacy view is effectively redundant |
| Partial day failures             | `components_loaded` column tracks which sub-documents succeeded; a future enhancement could retry only failed components rather than the whole day                                                        |
| Enterprise vs organisation scope | Config drives which scope is active; both can be enabled simultaneously                                                                                                                                   |
| `backfillFromDate` set too early | GitHub API returns 404 for dates before Oct 10, 2025; the task logs these as errors and continues — the gap-fill will not re-request them                                                                 |

---

## 10. Deliverables Summary

| Deliverable                                                                   | Package           | Phase |
| ----------------------------------------------------------------------------- | ----------------- | ----- |
| Replacement type definitions                                                  | `copilot-common`  | 1     |
| `GithubClient.ts` (replaced)                                                  | `copilot-backend` | 1     |
| DB migration for new tables (incl. `copilot_ingestion_log`)                   | `copilot-backend` | 2     |
| `DatabaseHandler.ts` (replaced; incl. `getMissingDays`, `upsertIngestionLog`) | `copilot-backend` | 2     |
| `TaskManagement.ts` (replaced; gap-fill backfill algorithm)                   | `copilot-backend` | 3     |
| `reportParser.ts` + `teamAggregator.ts`                                       | `copilot-backend` | 3     |
| `POST /backfill` + `GET /backfill/status` endpoints                           | `copilot-backend` | 4     |
| `router.ts` (replaced; new endpoints + legacy prefix)                         | `copilot-backend` | 4     |
| `CopilotApi` interface + client (replaced)                                    | `copilot`         | 5     |
| Dashboard pages + components (replaced) + `LegacyCopilotPage`                 | `copilot`         | 5     |
| Route updates + backfill progress banner                                      | `copilot`         | 5     |
| Config, docs, changelog                                                       | all               | 6     |
