# GitHub Copilot

This workspace contains plugins for integrating GitHub Copilot with Backstage, complete with metrics and insights for members of your organization or enterprise.

## Plugins

- [copilot](./plugins/copilot/README.md): Frontend plugin that provides the UI components and functionality.
- [copilot-common](./plugins/copilot-common/README.md): A common library containing shared types, permissions, and constants.
- [copilot-backend](./plugins/copilot-backend/README.md): Backend plugin that provides the API integration and database interactions.

## Architecture overview

```
GitHub API (report-based metrics, API version 2026-03-10)
        │
        ▼
copilot-backend  ──► scheduled task fetches 28-day rolling report
        │             (enterprise + organization)
        ▼
   SQLite / PostgreSQL database  (metrics, ide_completions, ide_chats, seats …)
        │
        ▼
  REST API exposed at /api/copilot/…
        │
        ▼
copilot (frontend)  ──► Backstage UI showing usage dashboards
```

Data is collected on a configurable schedule (default: every 2 hours). The backend fetches the latest 28-day report from GitHub, de-duplicates against what is already stored, and inserts only new day-level records.

> **Historical data:** The GitHub report API provides data from **October 10, 2025** onwards.
