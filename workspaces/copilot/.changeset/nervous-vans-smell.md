---
'@backstage-community/plugin-copilot-backend': patch
---

Improves the error-log to await if the error is of type Promise.

It also makes sure that a fresh Octokit is fetched every time the task runs.
