---
'@backstage-community/plugin-copilot-backend': patch
---

Reuse stored user metrics when completing team ingestion for a partially loaded day, refetching legacy reports when their breakdown data was not stored. Retries also re-ingest recent incomplete reports so available customization data is captured.
