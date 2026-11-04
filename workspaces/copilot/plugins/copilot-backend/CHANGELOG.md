# @backstage-community/plugin-copilot-backend

## 1.5.0

### Minor Changes

- 7e226cd: Backstage version bump to v1.56.2

### Patch Changes

- Updated dependencies [7e226cd]
  - @backstage-community/plugin-copilot-common@1.5.0

## 1.4.0

### Minor Changes

- e8a706e: Show named GitHub Copilot customization usage for skills, agents, MCP servers, commands, plugins, and future compatible categories.

### Patch Changes

- Updated dependencies [e8a706e]
  - @backstage-community/plugin-copilot-common@1.4.0

## 1.3.0

### Minor Changes

- 2da17b5: Add support for the new GitHub Copilot "AI credits consumed per user" metric (`ai_credits_used`).

  The per-user metric is now ingested into `copilot_user_metrics` and aggregated to team level
  (`total_ai_credits_used` on `copilot_daily_totals`). A new **Consumption** tab is shown in the V2
  dashboard when a team is selected, displaying the total AI credits used and a chart of consumption
  over the selected timeframe. AI credits are only exposed by the user-level report, so the tab is only
  available for team-scoped views.

- 2da17b5: Add ingestion and privacy-scoped serving of per-user Copilot metric breakdowns (by feature, IDE, language, model, and language/model), and a new `GET /v2/me/dashboard` endpoint that returns only the signed-in caller's own Copilot metrics.

  The caller's GitHub login is always resolved server-side from their own request credentials — this endpoint has no way to request another user's data. The default matching strategy uses the caller's `github.com/user-login` catalog annotation as their GitHub login; this can be customized by registering a resolver via the new `copilotUserResolverExtensionPoint`.

  Requires `copilot.ingestTeams: true` to be set, since per-user data is only ingested under that flag.

### Patch Changes

- 2da17b5: Fix `value "..." is out of range for type integer` ingestion errors on Postgres by widening `copilot_metrics_by_cli.output_tokens_sum` and `.prompt_tokens_sum` from `integer` to `bigint`. These columns store daily CLI token-usage sums which can exceed the 32-bit signed integer range (2,147,483,647) for large organizations/enterprises. SQLite does not enforce fixed-width integer storage, so this only manifested on Postgres-backed deployments.

  Previously, once this overflow occurred, the failing `insertByCli` call aborted ingestion for the entire day, which in turn silently skipped per-user and per-team aggregation for that day (e.g. `ai_credits_used`/`total_ai_credits_used`). `insertByCli` now merges (rather than ignores) on conflict, and a follow-up migration re-triggers ingestion for any previously-stored `copilot_metrics_by_cli` rows that show real CLI activity but have their token sums stuck at `0`, so historical data self-heals once re-ingested.

- b88c76a: Report downloads are now also allowed from the GHE.com tenant of the API base URL, so `copilot.host` can point at a dedicated `api.SUBDOMAIN.ghe.com` integration entry and still download reports from `copilot-reports.SUBDOMAIN.ghe.com`. This lets the Copilot token live apart from the GitHub App the rest of Backstage uses for `SUBDOMAIN.ghe.com`.
- 2da17b5: Fixed team-filtered V2 dashboard metrics (IDE Active Users, Agent Adoption, IDE
  Weekly Active Users) showing 0. Team-level daily totals had no rolling
  weekly/monthly active-user counts because GitHub's per-user API only exposes
  daily activity. These are now derived on read from the persisted per-user
  activity (`copilot_user_metrics` joined with `copilot_user_teams`) using GitHub's
  standard rolling windows (7-day weekly, 28-day monthly), including
  `monthly_active_agent_users` and `monthly_active_chat_users`.
- Updated dependencies [2da17b5]
- Updated dependencies [2da17b5]
  - @backstage-community/plugin-copilot-common@1.3.0

## 1.2.0

### Minor Changes

- ac132bb: Added support for GitHub Enterprise Cloud with data residency (GHE.com), including a new optional `copilot.apiBaseUrl` setting and a fix so GitHub App authentication targets the configured API host instead of always using `api.github.com`. Report downloads are now allowed from the configured `copilot.host` and its subdomains rather than a fixed list of `github.com` hosts, so GitHub Enterprise Server setups can download reports from their own instance too. An invalid `copilot.apiBaseUrl` is rejected on startup instead of silently falling back to the public GitHub API.
- 61c542e: Backstage version bump to v1.53.0
- 23dd212: Backstage version bump to v1.55.1

### Patch Changes

- fc7e7f4: Upgraded `zod` from v3 to v4.
- Updated dependencies [61c542e]
- Updated dependencies [23dd212]
  - @backstage-community/plugin-copilot-common@1.2.0

## 1.1.0

### Minor Changes

- 20bcf3c: Fix V2 dashboard 'Invalid Date' bug on PostgreSQL by normalizing date API outputs and adding defensive frontend parsing.
- 7a4ea48: Backstage version bump to v1.52.0

### Patch Changes

- fca2146: Fix enterprise v2 metrics ingestion: correct MiddlewareFactory.error() invocation, handle flat V2EnterpriseDayTotal response shape from GitHub 2026-03-10 report API, and prevent false-success log entry when 0 rows are parsed
- Updated dependencies [7a4ea48]
  - @backstage-community/plugin-copilot-common@1.1.0

## 1.0.0

### Major Changes

- 95bf1ed: BREAKING CHANGE - Implemented a V2 API that uses the new Copilot Metrics API and replaces the existing implementation. Leaving the existing database tables and a legacy UI in place for existing data.

### Minor Changes

- 6cf8553: Backstage version bump to v1.51.0

### Patch Changes

- Updated dependencies [95bf1ed]
- Updated dependencies [6cf8553]
  - @backstage-community/plugin-copilot-common@1.0.0

## 0.19.0

### Minor Changes

- b5e72fb: Backstage version bump to v1.50.3

### Patch Changes

- Updated dependencies [b5e72fb]
  - @backstage-community/plugin-copilot-common@0.18.0

## 0.18.4

### Patch Changes

- b5e5991: Updated better-sqlite3 to v12

## 0.18.3

### Patch Changes

- c120454: Updated dependency `@types/supertest` to `^7.0.0`.

## 0.18.2

### Patch Changes

- bc6b0b6: Backstage version bump to v1.48.4
- Updated dependencies [bc6b0b6]
  - @backstage-community/plugin-copilot-common@0.17.1

## 0.18.1

### Patch Changes

- b133c9d: Updated dependency `@types/supertest` to `^6.0.0`.

## 0.18.0

### Minor Changes

- c8ad8f8: Backstage version bump to v1.47.2

### Patch Changes

- Updated dependencies [c8ad8f8]
  - @backstage-community/plugin-copilot-common@0.17.0

## 0.17.1

### Patch Changes

- 6d3ed24: Updated dependency `supertest` to `^7.0.0`.

## 0.17.0

### Minor Changes

- d2133ca: Backstage version bump to v1.46.1

### Patch Changes

- Updated dependencies [d2133ca]
  - @backstage-community/plugin-copilot-common@0.16.0

## 0.16.0

### Minor Changes

- ac31365: Backstage version bump to v1.45.3

### Patch Changes

- Updated dependencies [ac31365]
  - @backstage-community/plugin-copilot-common@0.15.0

## 0.15.5

### Patch Changes

- 0a904fd: Normalized date format in task logs. Dates now display in ISO 8601 UTC format (`2025-11-03T00:00:00.000Z`) instead of locale-specific format (`Mon Nov 03 2025 01:00:00 GMT+0100 (Central European Standard Time)`).

## 0.15.4

### Patch Changes

- 14bf95c: Improves error logging. Changes Octokit to use the built in CreateAppAuth in order to automatically refresh expired tokens.

## 0.15.3

### Patch Changes

- 53e4a3b: fixes sql for engagement-metrics with the change from null to empty string.

## 0.15.2

### Patch Changes

- 1b7adc8: Fixed a mismatch between the backend requiring copilot.host and the config declaration stating it was optional.

## 0.15.1

### Patch Changes

- 3fd5298: Fixed an issue causing incorrect metrics to be displayed due to duplicate database entries for the same day.

## 0.15.0

### Minor Changes

- 4d1cf33: Backstage version bump to v1.44.0

### Patch Changes

- Updated dependencies [4d1cf33]
  - @backstage-community/plugin-copilot-common@0.14.0

## 0.14.0

### Minor Changes

- 8c60a7f: Backstage version bump to v1.43.2

### Patch Changes

- Updated dependencies [8c60a7f]
  - @backstage-community/plugin-copilot-common@0.13.0

## 0.13.0

### Minor Changes

- 181ea72: Various performance improvements for larger organizations

  - Only gather metrics from teams that have 5 or more members, teams
    with less members will not have any metrics provided by the api as
    documented here https://docs.github.com/en/rest/copilot/copilot-metrics?apiVersion=2022-11-28
  - To improve performance and reduce the API calls made on large orgs,
    we only need to retrieve the org and enterprise seats once per task.

## 0.12.0

### Minor Changes

- 5deb1e7: Backstage version bump to v1.42.3

### Patch Changes

- Updated dependencies [5deb1e7]
  - @backstage-community/plugin-copilot-common@0.12.0

## 0.11.0

### Minor Changes

- 3f606e1: Backstage version bump to v1.41.1

### Patch Changes

- Updated dependencies [3f606e1]
  - @backstage-community/plugin-copilot-common@0.11.0

## 0.10.2

### Patch Changes

- aaf1d82: Updated error logging to ensure error is visible in logs

## 0.10.1

### Patch Changes

- ba2b006: Updated configuration example in documentation

## 0.10.0

### Minor Changes

- d3221bf: Backstage version bump to v1.40.2

### Patch Changes

- Updated dependencies [d3221bf]
  - @backstage-community/plugin-copilot-common@0.10.0

## 0.9.4

### Patch Changes

- 8c13857: Updated dependency `@octokit/rest` to `20.1.2`.

## 0.9.3

### Patch Changes

- 6c0f6ee: Update README links to point to community-plugins repository.

## 0.9.2

### Patch Changes

- 0595499: Change to fetch correct enterprise seats instead of organisation seats in EnterpriseTask

## 0.9.1

### Patch Changes

- cd78d85: - Upgraded to Backstage release 1.38
  - Applied migration to the [New JXS Transform](https://backstage.io/docs/tutorials/jsx-transform-migration/)
- Updated dependencies [cd78d85]
  - @backstage-community/plugin-copilot-common@0.9.1

## 0.9.0

### Minor Changes

- bc2b3bf: Adds engagement metrics to be viewed. No personal details are currently stored.
  (Like information on who hasnt been using its license).

  This is done by fetching the seat billing information from Github.
  [API ref](https://docs.github.com/en/rest/copilot/copilot-user-management?apiVersion=2022-11-28#list-all-copilot-seat-assignments-for-an-organization)

  It then selects out the following metrics based of the billing information

  - Total assigned seats
  - Seats never used
    (user has undefined last_activity_at property)
  - Seats not used in the last 7/14/28 days
    (diff between "today" and last_activity_at)

  This is presented in a slightly different way since they are absolute numbers.
  The following metrics are presented based on the last day of the selected period range

  - Total assigned seats
  - Seats never used
  - Inactive seats last 7/14/28 days

  The following metrics are calculated as average for the selected period range
  excluding weekends (since usage usually goes down during theese days).

  - Avg Total Active users
  - Avg Total Engaged users
  - Avg IDE Completion users
  - Avg IDE Chat users
  - Avg Github.com Chat users
  - Avg Github.com PR users

  All of the new metrics also have an own bar chart displaying this over the selected period range.
  (Except seats not used in 7/14/28 days, who got a line-chart with multiple lines)

  The backend has also been updated to use Octokit to fetch data instead of own implementation.
  This also fixes the problem with pagination for some endpoints.

### Patch Changes

- Updated dependencies [bc2b3bf]
  - @backstage-community/plugin-copilot-common@0.9.0

## 0.8.0

### Minor Changes

- ec1324b: Backstage version bump to v1.37.0

### Patch Changes

- Updated dependencies [ec1324b]
  - @backstage-community/plugin-copilot-common@0.8.0

## 0.7.1

### Patch Changes

- 86f6523: Fix handling of optional editors attribute

## 0.7.0

### Minor Changes

- 2bae2d2: Backstage version bump to v1.36.1

### Patch Changes

- Updated dependencies [2bae2d2]
  - @backstage-community/plugin-copilot-common@0.7.0

## 0.6.0

### Minor Changes

- 10cacf8: Backend updated for using the new /metrics API that Github Provides.
  Added new tables to the database to store all metrics provided by Github.

  New metrics output from the backend are currently made compatible with the
  old format expected by the frontend in order to make minimum amount of changes
  in this version.

  The Backend router merges the old saved metrics with the new if the selected
  date range overlaps both old and new metrics. Otherwise it selects from eiter
  old or new.

  It also fetches the maximum availible date range taking into account that
  old metrics and/or new metrics are availible from the database.

### Patch Changes

- Updated dependencies [10cacf8]
  - @backstage-community/plugin-copilot-common@0.6.0

## 0.5.0

### Minor Changes

- f5be5aa: Backstage version bump to v1.35.1

### Patch Changes

- Updated dependencies [f5be5aa]
  - @backstage-community/plugin-copilot-common@0.5.0

## 0.4.0

### Minor Changes

- 6e44ae3: Added ability to use GitHub App authentication for organization level metrics

## 0.3.2

### Patch Changes

- e9b265d: Removed usages of `@backstage/backend-tasks`

## 0.3.1

### Patch Changes

- 6bf6fe4: Updated READMEs to clarify installation instructions including locations to run commands from and steps for new backend system

## 0.3.0

### Minor Changes

- 53e7191: Backstage version bump to v1.34.2

### Patch Changes

- Updated dependencies [53e7191]
  - @backstage-community/plugin-copilot-common@0.4.0

## 0.2.0

### Minor Changes

- 7f17c9f: Introduced support for organizations and team metrics visualization in the Copilot plugin.

### Patch Changes

- Updated dependencies [7f17c9f]
  - @backstage-community/plugin-copilot-common@0.3.0

## 0.1.6

### Patch Changes

- f6d006d: Added support for specifying private GitHub tokens dedicated to the Copilot plugin. This is useful if you don't want to use the same token for both the Copilot backend and other GitHub integrations. To do this, you can specify a new GitHub integration using a string as the host:

  ```diff
    integrations:
      github:
        - host: github.com
          token: your_token
  +     - host: your_copilot_private_token
  +       token: your_super_token
  +       apiBaseUrl: https://api.github.com
    copilot:
  -   host: github.com
  +   host: your_copilot_private_token
      enterprise: your_enterprise
  ```

## 0.1.5

### Patch Changes

- e45e2f8: Remove unused @backstage/backend-common package from dependencies.

## 0.1.4

### Patch Changes

- 399dc3b: Backstage version bump to v1.32.2
- Updated dependencies [399dc3b]
  - @backstage-community/plugin-copilot-common@0.2.2

## 0.1.3

### Patch Changes

- 0617e87: Backstage version bump to v1.31.1
- Updated dependencies [0617e87]
  - @backstage-community/plugin-copilot-common@0.2.1

## 0.1.2

### Patch Changes

- Updated dependencies [c55888b]
  - @backstage-community/plugin-copilot-common@0.2.0

## 0.1.1

### Patch Changes

- ad6f23d: Backstage version bump to v1.30.2
- Updated dependencies [ad6f23d]
  - @backstage-community/plugin-copilot-common@0.1.1

## 0.1.0

### Minor Changes

- 2d5f011: Introduced the GitHub Copilot plugin, checkout the plugin's [`README.md`](https://github.com/backstage/community-plugins/tree/main/workspaces/copilot/plugins/copilot) for more details!

### Patch Changes

- Updated dependencies [2d5f011]
  - @backstage-community/plugin-copilot-common@0.1.0
