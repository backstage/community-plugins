---
'@backstage-community/plugin-mend': major
---

- Updated the frontend plugin to align with the new annotation-based project mapping approach in the backend.
- Project IDs from the `mend.io/project-ids` annotation are now used as redirect values when navigating from the Project List to the Mend tab.
- Added `isMendProjectAvailable` helper to conditionally render the Mend tab only when the `mend.io/project-ids` annotation is present on the entity.
