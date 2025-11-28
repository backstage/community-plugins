---
'@backstage-community/plugin-announcements': major
---

# Major Release: Admin Portal Consolidation

Releases the first major version of the plugin with support for two primary entry points:

- `AnnouncementsPage` - A page that displays all announcements that end users consume
- `AdminPortal` - A unified portal for managing announcements, categories, and tags

With this major release, we are consolidating all functionality into the admin portal. The previous version provides individual pages for each of these entry points which have now been removed.

As the plugin's adoption grew, more requests to hide UI components based on permissions came in. This decision was made to simplify the plugin and reduce the complexity of the codebase. It also provides a more consistent UX for admin operations and allows for more flexibility in the future.

## Breaking Changes

### Removed Routes

The following route references have been removed and are no longer available:

- `announcementCreateRouteRef` - Use `announcementAdminRouteRef` instead
- `announcementEditRouteRef` - Use `announcementAdminRouteRef` instead
- `categoriesListRouteRef` - Categories are now managed within the Admin Portal
- `tagsListRouteRef` - Tags are now managed within the Admin Portal

### Removed Components

The following components have been removed:

- `CreateAnnouncementPage` - Replaced by `AdminPortal` with Announcements tab
- `EditAnnouncementPage` - Replaced by `AdminPortal` with Announcements tab
- `CategoriesPage` - Replaced by `AdminPortal` with Categories tab
- `TagsPage` - Replaced by `AdminPortal` with Tags tab
- `NewCategoryDialog` - Category creation is now handled inline within the Categories tab
- `NewTagDialog` - Tag creation is now handled inline within the Tags tab

### Component Reorganization

Admin-related components have been reorganized into feature-specific directories:

- `Admin/AnnouncementsContent/` - Contains announcement management components
- `Admin/CategoriesContent/` - Contains category management components
- `Admin/TagsContent/` - Contains tag management components

## Benefits

- Single entry point for all admin operations (`/announcements/admin`)
- Less code to maintain - removed duplicate page components
- Reduction in code duplication - shared form logic consolidated
- Less code to migrate to `@backstage/ui` and the new frontend system
- Improved UX with tabbed interface for related admin operations
- Better permission handling - all admin operations gated through one portal

## Highlights

- The button to create a new announcement has been removed from the announcements page. This button is now only available in the admin portal.
- The context menu has been updated to only include a link to the admin portal. Links to the individual pages for categories and tags have been removed.
- All admin operations (create/edit announcements, manage categories, manage tags) are now accessible through a unified tabbed interface in the Admin Portal.
- The `AnnouncementsCard` component now links to the admin portal instead of the create page.

## Migration Guide

If you have custom integrations or links to the old routes, update them as follows:

**Before:**

```tsx
import { announcementCreateRouteRef } from '@backstage-community/plugin-announcements';
const createLink = useRouteRef(announcementCreateRouteRef);
```

**After:**

```tsx
import { announcementAdminRouteRef } from '@backstage-community/plugin-announcements';
const adminLink = useRouteRef(announcementAdminRouteRef);
```

All admin functionality is now accessible at the `/admin` route under the announcements root path.
