---
'@backstage-community/plugin-tech-insights-node': minor
---

Added an optional `signal` to `FactRetrieverContext`. It is an `AbortSignal` that aborts when a fact retriever run times out or the backend shuts down, so retrievers can stop early instead of running on after the scheduler has released the task.
