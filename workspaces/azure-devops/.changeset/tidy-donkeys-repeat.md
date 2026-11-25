---
'@backstage-community/plugin-azure-devops-backend': patch
---

Fixed the README card treating a folder as markdown. When `dev.azure.com/readme-path` points at a folder, the backend now falls back to the `README.md` inside it, and returns a clear `NotFoundError` when that folder has no README instead of rendering the folder listing as markdown.
