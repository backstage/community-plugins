---
'@backstage-community/plugin-tech-insights-backend': major
---

This version includes breaking changes related to permissions. Please review the changes carefully before upgrading:

- Added required permissions for accessing Tech Insights features
- Users must now have the appropriate policies added to their roles to access Tech Insights functionality
- This change enforces better security by ensuring explicit permission grants for Tech Insights operations

To upgrade, you'll need to:

1. Update your permission policies to include the necessary Tech Insights permissions
2. Ensure your users' roles have the appropriate policies assigned
