---
'@backstage-community/plugin-shortcuts': patch
---

Fix deprecated Backstage APIs in shortcuts plugin

Replaces the deprecated AlertApi with ToastApi in AddShortcut and
EditShortcut, mapping display: 'transient' to a 5000ms timeout per
the migration guide. Also replaces deprecated test utilities
MockStorageApi and MockAnalyticsApi with mockApis.storage() and
mockApis.analytics.mock() across the plugin's test suite.

IconComponent in Shortcuts.tsx remains deprecated — it can't be
switched to IconElement until @backstage/core-components' SidebarItem
accepts it upstream.
