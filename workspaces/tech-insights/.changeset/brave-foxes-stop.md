---
'@backstage-community/plugin-tech-insights-backend': patch
---

Fact retrievers now receive the scheduler's abort signal as `signal` in their `FactRetrieverContext`. It aborts when a run exceeds its configured `timeout` or the backend shuts down, so long-running retrievers can stop instead of overlapping with a new run on another instance.
