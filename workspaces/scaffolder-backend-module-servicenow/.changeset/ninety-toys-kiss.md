---
'@backstage-community/plugin-scaffolder-backend-module-servicenow': patch
---

ServiceNow Table API scaffolder actions now fall back to the HTTP status text (or a clear default) when the API error body omits `error.message`, so template failures surface a useful message instead of an empty error.

Added a contributor guide (`CONTRIBUTING.md`) and a local `dev/` harness so maintainers can smoke-test scaffolder action registration without a full workspace app. Expanded automated tests to cover module wiring, ServiceNow config fail-fast, shared MSW helpers with OpenAPI isolation, and representative API error paths.
