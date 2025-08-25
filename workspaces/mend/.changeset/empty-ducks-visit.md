---
'@backstage-community/plugin-mend-backend': minor
'@backstage-community/plugin-mend': minor
---

Fixed Issue #4856 – Updated the logic to map projects and Backstage entities based on the repository URL instead of the project name.
Resolved an issue where multiple projects sharing the same `sourceUrl` were not all being displayed.
Enhanced the Finding Overview tab by adding a multi-select filter and a new column to display the Project Name in the Findings table.
