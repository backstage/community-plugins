---
'@backstage-community/plugin-copilot-backend': patch
---

Treat unavailable organization report days as gaps rather than access failures,
hide organizations when GitHub explicitly denies report access, preserve
existing metrics when organization login casing differs, and keep
configured-organization reports available without enterprise multi-org
ingestion.
