---
'@backstage-community/plugin-copilot-backend': patch
---

Fix `value "..." is out of range for type integer` ingestion errors on Postgres by widening `copilot_metrics_by_cli.output_tokens_sum` and `.prompt_tokens_sum` from `integer` to `bigint`. These columns store daily CLI token-usage sums which can exceed the 32-bit signed integer range (2,147,483,647) for large organizations/enterprises. SQLite does not enforce fixed-width integer storage, so this only manifested on Postgres-backed deployments.

Previously, once this overflow occurred, the failing `insertByCli` call aborted ingestion for the entire day, which in turn silently skipped per-user and per-team aggregation for that day (e.g. `ai_credits_used`/`total_ai_credits_used`). `insertByCli` now merges (rather than ignores) on conflict, and a follow-up migration re-triggers ingestion for any previously-stored `copilot_metrics_by_cli` rows that show real CLI activity but have their token sums stuck at `0`, so historical data self-heals once re-ingested.
