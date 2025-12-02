---
'@backstage-community/plugin-announcements-react': patch
'@backstage-community/plugin-announcements': patch
---

Adds a new useAnnouncementsPermissions hook users can leverage when needing quick access to all permissions, something we commonly do throughout the admin portal. All components now leverage this hook instead of using the usePermission hook directly.
