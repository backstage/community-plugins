---
'@backstage-community/plugin-github-issues': patch
---

Fixed the GitHub Issues card failing to load for entities that own a repository whose name starts with a number (for example `123-service`). The repository name was used directly as a GraphQL alias, which GitHub rejects when it begins with a digit, causing the whole batched request — and every other repository in it — to fail.
