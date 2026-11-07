---
'@backstage-community/plugin-npm-backend': minor
---

Added two read-only actions to the actions registry: `npm:get-package-info` returns general package information including the latest version and its release date, and `npm:list-package-versions` returns the most recently published versions with their release dates. This makes the information shown in the npm cards also available to AI agents (MCP) and other plugins.
