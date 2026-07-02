---
'@backstage-community/plugin-copilot-backend': patch
---

Fix enterprise v2 metrics ingestion: correct MiddlewareFactory.error() invocation, handle flat V2EnterpriseDayTotal response shape from GitHub 2026-03-10 report API, and prevent false-success log entry when 0 rows are parsed
