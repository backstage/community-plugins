---
'@backstage-community/plugin-tech-insights-backend': minor
---

Added `POST /facts/refresh/:namespace/:kind/:name` to refresh the facts of a single entity right away instead of waiting for the next scheduled run. An optional `factRetrieverIds` body limits which fact retrievers run.
