---
'@backstage-community/plugin-copilot-backend': minor
'@backstage-community/plugin-copilot-common': minor
---

Add ingestion and privacy-scoped serving of per-user Copilot metric breakdowns (by feature, IDE, language, model, and language/model), and a new `GET /v2/me/dashboard` endpoint that returns only the signed-in caller's own Copilot metrics.

The caller's GitHub login is always resolved server-side from their own request credentials — this endpoint has no way to request another user's data. The default matching strategy uses the caller's catalog user entity name as their GitHub login; this can be customized by registering a resolver via the new `copilotUserResolverExtensionPoint`.

Requires `copilot.ingestTeams: true` to be set, since per-user data is only ingested under that flag.
