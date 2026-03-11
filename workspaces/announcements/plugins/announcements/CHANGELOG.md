# @backstage-community/plugin-announcements

## 2.4.0

### Minor Changes

- 8b42b6b: Backstage version bump to v1.48.2

### Patch Changes

- Updated dependencies [8b42b6b]
  - @backstage-community/plugin-announcements-common@0.18.0
  - @backstage-community/plugin-announcements-react@0.22.0

## 2.3.0

### Minor Changes

- 5a984ed: - Added support for overriding `title`, `hideStartAt` and `markdownRenderer` via app-config for announcements page.
  - `category` and `defaultInactive` props are now deprecated and will be removed in future releases. Use URL state to filter by category (e.g. `?category=...`). Inactive announcements are now hidden by default.
  - Update @uiw/react-md-editor dependency to version 4.0.11.

## 2.2.0

### Minor Changes

- 57c349e: `AnnouncementsOptions` has been dropped as an optional arg for the `useAnnouncements` hook in favor of handling state and dependencies internally.

### Patch Changes

- Updated dependencies [57c349e]
  - @backstage-community/plugin-announcements-react@0.21.0

## 2.1.0

### Minor Changes

- 99b4b52: Backstage version bump to v1.47.2

### Patch Changes

- 1a71b9a: The On Behalf Of form component is now rewritten with `@backstage/ui`. The announcements table will now display the on behalf of group alongside publisher if present.
- 3e53912: The tags select component in the announcements form has been swapped with our new `@backstage/ui` select implementation
- 44a0337: The category selection in the announcements form has been refactored to use the new `CategorySelectInput` and `CreateCategoryDialog` components written with `@backstage/ui`. Category creation is now handled through the same mechanism as the categories table.
- 64a82b0: Updates all non-date related text inputs to use the `TextField` from `@backstage/ui`.
- 6f6d4c8: Switch components in the announcements form have been migrated to use `@backstage/ui`. The "Send notifications" label now includes support for translations.
- 41f738e: Updates the announcements form to use `@backstage/ui` for the following components:

  - Box
  - Button
  - InfoCard -> Card, CardBody, CardHeader
  - Grid
  - Typography -> Text
  - Paper -> _removed_
  - Divider -> _removed_

  These are minor changes that do not affect the functionality of the announcements form.

- Updated dependencies [44a0337]
- Updated dependencies [6f6d4c8]
- Updated dependencies [99b4b52]
  - @backstage-community/plugin-announcements-react@0.20.0
  - @backstage-community/plugin-announcements-common@0.17.0

## 2.0.0

### Major Changes

- ad6eb1b: Refactor legacy announcements frontend to use the new (NFS) components built with `@backstage/ui`.

  ## Breaking Changes

  - `AnnouncementsPage` **no longer supports** the following props:

    - `themeId`
    - `subtitle`
    - `hideContextMenu`
    - `cardOptions`
    - `buttonOptions`
    - `hideInactive`

    If your app passed any of these props, you must remove them (or migrate to new equivalents if/when they are reintroduced by the NFS implementation).

  - `AdminPortal` is now implemented via the new announcements admin page and no longer supports customization via props such as `themeId`, `title`, `subtitle`, or `defaultInactive`.

### Patch Changes

- 89bf3ae: Updated the Search components for the New Frontend System to use the `RecordVoiceOverIcon` to match the existing experince

## 1.4.0

### Minor Changes

- c299df2: Backstage version bump to v1.47.1

### Patch Changes

- 9c5efc7: Tables built with `@backstage/ui` now incorporate the new `useTable` hook.
- 14ea727: The create announcements button in the admin portal now matches same style as category and tags for users of the new frontend system. This release does not affect users on the existing frontend system.
- Updated dependencies [c299df2]
- Updated dependencies [14ea727]
  - @backstage-community/plugin-announcements-common@0.16.0
  - @backstage-community/plugin-announcements-react@0.19.0

## 1.3.2

### Patch Changes

- ee5069b: Adds filtering components for categories and tags to the announcements page in the new frontend system.
- d901927: Removed unused dependencies from the package
- Updated dependencies [d901927]
- Updated dependencies [ee5069b]
  - @backstage-community/plugin-announcements-react@0.18.2

## 1.3.1

### Patch Changes

- c107e8f: For users on the new frontend system:

  - Prevents announcements table from erroring on invalid publisher ref
  - Fixes the size of the active status indicator and prevents it from stretching next to a smaller announcement title

- a065bb2: The announcements table in the admin portal has been rewritten with `@backstage/ui` for users on the new frontend system. Users on the existing frontend system will not see any changes.
- a6d55dd: Update the back to announcements button to recognize whether to take you back to list of announcements or admin portal depending on where you came from.
- cd38562: The announcements page in the new frontend system now shows only active announcements by default. For the existing frontend system, the `hideInactive` prop must still be passed to the `AnnouncementsPage` component to hide inactive announcements.
- Updated dependencies [a6d55dd]
- Updated dependencies [a065bb2]
  - @backstage-community/plugin-announcements-react@0.18.1

## 1.3.0

### Minor Changes

- b9c2943: Backstage version bump to v1.46.1

### Patch Changes

- ce95092: The core announcements page end users visit has been rewritten with `@backstage/ui` for users on the new frontend system. Users on the existing frontend system will not see any changes.
- 699c87f: Updated dependency `cross-fetch` to `4.1.0`.
- fb4ae44: The category and tag content tabs in the admin portal have been rewritten with `@backstage/ui` for users on the new frontend system. Users on the existing frontend system will not see any changes.
- Updated dependencies [d5dc6b3]
- Updated dependencies [ce95092]
- Updated dependencies [b9c2943]
  - @backstage-community/plugin-announcements-react@0.18.0
  - @backstage-community/plugin-announcements-common@0.15.0

## 1.2.0

### Minor Changes

- 411e4c6: Backstage version bump to v1.46.0.
  This release includes fix for frontend error `Package subpath './' is not defined by "exports"`.

### Patch Changes

- 0768c4e: - New dedicated routes to the admin portal (`/announcements/admin`, `/announcements/admin/categories`, `/announcements/admin/tags`)

  - The exported `AnnouncementsTimeline` and `AnnouncementsAdminPortal` components have been deprecated as they will not be migrated to the new frontend system. Please see each component's deprecation notice for more details.

  ### New frontend system + @backstage/ui updates

  We are rebuilding several major components of the announcements plugin from scratch leveraging the `@backstage/ui` library. To start, the admin portal now leverages the new header component from the `@backstage/ui` library. Users who have migrated to the new frontend system will gradually receive these until the plugin is fully migrated. Users on the existing frontend system will not see any changes.

- Updated dependencies [411e4c6]
  - @backstage-community/plugin-announcements-common@0.14.0
  - @backstage-community/plugin-announcements-react@0.17.0

## 1.1.0

### Minor Changes

- 40b8d32: Internal refactor to consolidate delete dialog state management in the admin portal. Refactoring categories and tags to the shared component added support for translations which was previously missing.

  The refactor includes a new set of translation keys for the generic delete dialog.

  ### Translation Changes

  Added new translation keys for the delete dialog:

  - `confirmDeleteDialog.title`
  - `confirmDeleteDialog.cancel`
  - `confirmDeleteDialog.delete`

  Deprecated the following translation keys:

  - `deleteDialog.title`
  - `deleteDialog.cancel`
  - `deleteDialog.delete`

### Patch Changes

- e6b9dd8: Replaces global `JSX` namespace with `React.JSX` to resolve deprecation
- 6b45ee7: Adds a new useAnnouncementsPermissions hook users can leverage when needing quick access to all permissions, something we commonly do throughout the admin portal. All components now leverage this hook instead of using the usePermission hook directly.
- Updated dependencies [6b45ee7]
- Updated dependencies [40b8d32]
  - @backstage-community/plugin-announcements-react@0.16.0

## 1.0.0

### Major Changes

- dc3ce7f: # Major Release: Admin Portal Consolidation

  Releases the first major version of the plugin with support for two primary entry points:

  - `AnnouncementsPage` - A page that displays all announcements that end users consume
  - `AdminPortal` - A unified portal for managing announcements, categories, and tags

  With this major release, we are consolidating all functionality into the admin portal. The previous version provides individual pages for each of these entry points which have now been removed.

  As the plugin's adoption grew, more requests to hide UI components based on permissions came in. This decision was made to simplify the plugin and reduce the complexity of the codebase. It also provides a more consistent UX for admin operations and allows for more flexibility in the future.

  ## Highlights

  - The button to create a new announcement has been removed from the announcements page. This button is now only available in the admin portal.
  - The context menu has been updated to only include a link to the admin portal. Links to the individual pages for categories and tags have been removed.
  - All admin operations (create/edit announcements, manage categories, manage tags) are now accessible through a unified tabbed interface in the Admin Portal.
  - The `AnnouncementsCard` component now links to the admin portal instead of the create page.

  ## Breaking Changes

  ### Removed Routes

  The following route references have been removed and are no longer available:

  - `announcementCreateRouteRef` - Use `announcementAdminRouteRef` instead
  - `announcementEditRouteRef` - Use `announcementAdminRouteRef` instead
  - `categoriesListRouteRef` - Categories are now managed within the Admin Portal
  - `tagsListRouteRef` - Tags are now managed within the Admin Portal

  ## Translation Changes

  The following translation keys have been removed:

  - `announcementsPage.contextMenu.categories`
  - `announcementsPage.contextMenu.tags`

  The following translation keys have been updated:

  - `announcementsPage.contextMenu.admin` - Updated to "Manage announcements"

  ### Removed Components

  The following components have been removed:

  - `CreateAnnouncementPage` - Replaced by `AdminPortal` with Announcements tab
  - `EditAnnouncementPage` - Replaced by `AdminPortal` with Announcements tab
  - `CategoriesPage` - Replaced by `AdminPortal` with Categories tab
  - `TagsPage` - Replaced by `AdminPortal` with Tags tab
  - `NewCategoryDialog` - Category creation is now handled inline within the Categories tab
  - `NewTagDialog` - Tag creation is now handled inline within the Tags tab

  ## Benefits

  A big benefit of this consolidation is it reduces the amount of code we must migrate to support both the new frontend system and the new `@backstage/ui` library which we are in the process of doing. Others include:

  - Single entry point for all admin operations (`/announcements/admin`)
  - Less code to maintain - removed duplicate page components
  - Reduction in code duplication - shared form logic consolidated
  - Improved UX with tabbed interface for related admin operations
  - Better permission handling - all admin operations gated through one portal

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

  All admin functionality is now accessible at the `/announcements/admin` route.

### Patch Changes

- 0fb63ba: Adds support for editing an announcement in the admin portal. Clicking the edit icon will no longer take the end user to a separate edit page.

## 0.17.0

### Minor Changes

- bda0481: Backstage version bump to v1.45.1

### Patch Changes

- 21f564f: Switched the entity card extension to be disabled by default.
- Updated dependencies [bda0481]
  - @backstage-community/plugin-announcements-common@0.13.0
  - @backstage-community/plugin-announcements-react@0.15.0

## 0.16.2

### Patch Changes

- 43e6d99: Added analytics event tracking for announcement link clicks. When users click on an announcement with a `link` property, an analytics event is now captured using the [Plugin Analytics](https://backstage.io/docs/plugins/analytics/#capturing-events). This applies to the following components: `AnnouncementsCard`, `AnnouncementPage`,`NewAnnouncementBanner`.
- 0b8dedf: Fix Announcements banner error `Routing context is not available` when using the banner with the new frontend system.

## 0.16.1

### Patch Changes

- 9987329: The success message shown when an announcement is created is now transient
- ffb26dc: Fixed routing issue where some links were incorrectly redirecting to `/announcements/admin` instead of `/announcements`. Changed `<AnnouncementsAdminPortal />` from a routable extension to a component extension to resolve the mount point conflict with the main `<AnnouncementsPage />`.
- f39d97f: Added announcement banner as app root element for the new frontend system.

## 0.16.0

### Minor Changes

- 1c076d9: - Centered text for empty tables in:
  - Announcements
  - Category
  - Tags
  - Properly mounted in the frontend the `/tags` path
  - Updated `CategoriesPage` and `TagsPage` in order to display the `ContextMenu`
  - Added titleLength prop in order to truncate title on `AnnouncementDetails`
  - Fixed insert of Categories from `CategoriesPage` and clean up on dialog
  - Added in the `NewAnnouncementBanner` a `cardOptions={{titleLength,excerptLength }}` props, this would allow to truncate text. Default is 50.
  - Now in the `NewAnnouncementBanner` when the title get clicked, the alert is dismissed as user navigate to alert details

### Patch Changes

- Updated dependencies [95470f7]
  - @backstage-community/plugin-announcements-common@0.12.1
  - @backstage-community/plugin-announcements-react@0.14.1

## 0.15.0

### Minor Changes

- cd040b2: Backstage version bump to v1.44.0

### Patch Changes

- Updated dependencies [cd040b2]
  - @backstage-community/plugin-announcements-common@0.12.0
  - @backstage-community/plugin-announcements-react@0.14.0

## 0.14.0

### Minor Changes

- d34e875: Added updated_at field, extended sorting capabilities NewAnnouncementsBanner

### Patch Changes

- Updated dependencies [d34e875]
  - @backstage-community/plugin-announcements-common@0.11.0
  - @backstage-community/plugin-announcements-react@0.13.0

## 0.13.1

### Patch Changes

- 93bb787: Fixed the typings for the Announcements new frontend system plugin, which previously prevented correct overriding.
- 6efe1a3: - Fixed table rendering in `<AnnouncementsPage markdownRenderer="md-editor" />`. Table styling was not correctly applied when using the Backstage Light theme.
  - Updated `@uiw/react-md-editor` dependency to `^4.0.8`.

## 0.13.0

### Minor Changes

- aca5bee: Adds `defaultInactive` prop to `AnnouncementsPage`, to be used as the initial form value of `active` for new announcements.
- 58ccd64: Fixed handling of `active` prop in NewAnnouncementBanner
  Extended signal and notification on update when the annoucencement is activated
  Updated `EditAnnoucementPage` to navigate to root path as the announcement creation page
  Updated `EditAnnoucementPage` alertApi on success to be transient
- 2d1724c: Backstage version bump to v1.43.2

### Patch Changes

- 0d56a66: Added search extensions for new frontend system
- Updated dependencies [2d1724c]
  - @backstage-community/plugin-announcements-common@0.10.0
  - @backstage-community/plugin-announcements-react@0.12.0

## 0.12.1

### Patch Changes

- 2007a96: Fixed #5322 that caused `500` errors when fetching existing announcements with null `until_date`.
- Updated dependencies [2007a96]
  - @backstage-community/plugin-announcements-common@0.9.1
  - @backstage-community/plugin-announcements-react@0.11.1

## 0.12.0

### Minor Changes

- 4a3e603: Added support for an `until_date` field in announcements and introduced a new `current` filter.
- 4a89fd8: With these changes, notifications can be enabled whenever new announcement is created. Announcement notifications are disabled by-default. For details, about notification, please refer [`Notifications`](https://backstage.io/docs/notifications/) docs.

  announcements: integration with notifications #4378

### Patch Changes

- 92b9e8c: Fix a bug in the Edit announcement page where the page does not update the announcement if the announcement is missing a category
- Updated dependencies [4a3e603]
- Updated dependencies [4a89fd8]
  - @backstage-community/plugin-announcements-common@0.9.0
  - @backstage-community/plugin-announcements-react@0.11.0

## 0.11.0

### Minor Changes

- e121abb: Backstage version bump to v1.42.3

### Patch Changes

- d70723f: Allow creating new announcement category for edit
- Updated dependencies [e121abb]
- Updated dependencies [d70723f]
  - @backstage-community/plugin-announcements-common@0.8.0
  - @backstage-community/plugin-announcements-react@0.10.0

## 0.10.2

### Patch Changes

- 7ad0cd0: Fixes an issue where an empty list of userOwnershipRefs causes excessive api calls to the catalog when creating a new announcement.
- Updated dependencies [7ad0cd0]
  - @backstage-community/plugin-announcements-react@0.9.1

## 0.10.1

### Patch Changes

- 0ab4439: Updated the New Frontend System NavItem to use the `RecordVoiceOverIcon` instead of the `NotificationsIcon` to avoid confusion with the Backstage Notifications NavItem
- 1a08ba6: Fixed an issue where your would get a "Routing context not available" error when using the New Frontend System

## 0.10.0

### Minor Changes

- bb76f4e: This change introduces tag filtering to announcements, allowing users to filter by tag by clicking on a tag on an announcement card.
- 220cc20: Backstage version bump to v1.41.1

### Patch Changes

- dc03b75: Remove redundant `EntityPeekAheadPopover` when hovering over user or group entity.
- 477eeb0: Reorganized the Create Announcement form: optional fields have been moved below the Markdown editor for improved layout. This change also includes MUI component updates, upgrading them to MUI v5.
- ee361a8: Removed a redundant inner check for `tags` existence and length.
- Updated dependencies [bb76f4e]
- Updated dependencies [220cc20]
  - @backstage-community/plugin-announcements-react@0.9.0
  - @backstage-community/plugin-announcements-common@0.7.0

## 0.9.0

### Minor Changes

- 775d236: Backstage version bump to v1.40.2

### Patch Changes

- Updated dependencies [775d236]
  - @backstage-community/plugin-announcements-common@0.6.0
  - @backstage-community/plugin-announcements-react@0.8.0

## 0.8.0

### Minor Changes

- 8c803d8: Added support for tags in announcements

### Patch Changes

- Updated dependencies [8c803d8]
  - @backstage-community/plugin-announcements-react@0.7.0
  - @backstage-community/plugin-announcements-common@0.5.1

## 0.7.2

### Patch Changes

- 822489e: Fixed missing markdownRenderer prop in router that prevented setting the Markdown renderer `backstage` or `md-editor`.

## 0.7.1

### Patch Changes

- 6a14453: Add support for configurable markdown rendering with two options: "backstage" (default, theme-consistent) and "md-editor" (WYSIWYG-like rendering with richer markdown support)
- b5402a7: Fix pagination issue when fetching groups. This resolves the issue where the "On-Behalf" team dropdown always displayed only 10 groups.
- Updated dependencies [b5402a7]
  - @backstage-community/plugin-announcements-react@0.6.1

## 0.7.0

### Minor Changes

- 7e38fa0: Backstage version bump to v1.39.1

### Patch Changes

- dc57fe9: Optimize query by filtering only entries with `kind: group`. Add `displayName` to the "On behalf of" dropdown for easier group identification and selection.
- Updated dependencies [7e38fa0]
- Updated dependencies [dc57fe9]
  - @backstage-community/plugin-announcements-common@0.5.0
  - @backstage-community/plugin-announcements-react@0.6.0

## 0.6.1

### Patch Changes

- e4bd3e6: remove direct dependency on '@types/node'

## 0.6.0

### Minor Changes

- 9c94358: Added support for submitting announcements on behalf of a team the user is a member of.
  This field is optional. if not specified, the announcement will be submitted using the current publisher user.

### Patch Changes

- Updated dependencies [9c94358]
  - @backstage-community/plugin-announcements-common@0.4.0
  - @backstage-community/plugin-announcements-react@0.5.0

## 0.5.10

### Patch Changes

- dd1aed2: fix(ui): Respect MUI theme options for typography, colors
- Updated dependencies [dd1aed2]
  - @backstage-community/plugin-announcements-react@0.4.4

## 0.5.9

### Patch Changes

- ecfbf02: Remove legacy React packages in preparation for React 19 upgrade.

## 0.5.8

### Patch Changes

- 11be6bb: chore(deps): Upgrade to Backstage 1.38
- Updated dependencies [11be6bb]
  - @backstage-community/plugin-announcements-common@0.3.2
  - @backstage-community/plugin-announcements-react@0.4.3

## 0.5.7

### Patch Changes

- 32b99b3: - Add `hideStartAt` React prop to allow hiding the "Start at" date label on announcements card

  ```diff
  - <AnnouncementsCard max={2} />
  + <AnnouncementsCard max={2} hideStartAt />
  ```

## 0.5.6

### Patch Changes

- 1f34951: Upgraded to Backstage release 1.37.
- Updated dependencies [1f34951]
  - @backstage-community/plugin-announcements-common@0.3.1
  - @backstage-community/plugin-announcements-react@0.4.2

## 0.5.5

### Patch Changes

- 3d819b6: Replaced HTML elements with MUI components in `AnnouncementsCard` and `AnnouncementsPage` for uniform styling.

## 0.5.4

### Patch Changes

- fe62f42: Improved relative date display for scheduled announcements. When the Start At date is set for the current day, it now shows "Scheduled Today" instead of "Occurred X hours ago"
- Updated dependencies [fe62f42]
  - @backstage-community/plugin-announcements-react@0.4.1

## 0.5.3

### Patch Changes

- 3b99ef7: - Fixed Active field column in announcements admin table, which was preventing proper sorting by `active` state.
  - Enhanced readability of the Active status in the admin announcements table using `Status` components.

## 0.5.2

### Patch Changes

- d1e46c9: Updated context menu visibility logic to dynamically show or hide options based on the create permission.

## 0.5.1

### Patch Changes

- a8e2f2c: Updated dependency `@material-ui/lab` to `4.0.0-alpha.61`.
  Updated dependency `@mui/icons-material` to `5.16.14`.
  Updated dependency `@mui/material` to `5.16.14`.
  Updated dependency `@mui/styles` to `5.16.14`.
  Updated dependency `@mui/x-charts` to `6.19.8`.
  Updated dependency `@mui/lab` to `5.0.0-alpha.175`.

## 0.5.0

### Minor Changes

- 22d99d3: - Added a `start at` field to allow users to set the date when an announcement occurred.
  - Announcements can now be sorted by `createdAt` (default) or `startAt` date, with customizable order (`desc` or `asc`).
  - Updated the New Announcement form to accommodate `start at` and future fields.
  - Added `Created at` and `Start at` columns to the admin view table.

### Patch Changes

- Updated dependencies [22d99d3]
  - @backstage-community/plugin-announcements-common@0.3.0
  - @backstage-community/plugin-announcements-react@0.4.0

## 0.4.0

### Minor Changes

- f253ff9: **breaking** - previously deprecated exports have been removed

### Patch Changes

- Updated dependencies [f253ff9]
  - @backstage-community/plugin-announcements-react@0.3.1

## 0.3.0

### Minor Changes

- 5c2483c: **BREAKING** Fixed a typo in translation keys (announecementsContent → announcementsContent), requiring all references to be updated to prevent missing translations.

### Patch Changes

- Updated dependencies [5c2483c]
  - @backstage-community/plugin-announcements-react@0.3.0

## 0.2.0

### Minor Changes

- e06ffa0: Backstage version bump to v1.35.1

### Patch Changes

- Updated dependencies [e06ffa0]
  - @backstage-community/plugin-announcements-common@0.2.0
  - @backstage-community/plugin-announcements-react@0.2.0

## 0.1.6

### Patch Changes

- 9cea4f3: Removed divider from AnnouncementSearchResultListItem

## 0.1.5

### Patch Changes

- 1909e4d: Added announcement ID to the useAsync dependency array in the AnnouncementPage component.

  This fixes an issue where the AnnouncementPage component did not re-fetch the announcement details when the ID in the routing path changed. As a result the user who was on the AnnouncementPage couldn't see the details of the next announcement they accessed, e.g. from the search dialogue.

- ef67a29: Fixed bug in AnnouncementPage component where subheader spacing was missing

## 0.1.4

### Patch Changes

- e282a2d: Minor improvements to README documentation
- Updated dependencies [e282a2d]
  - @backstage-community/plugin-announcements-common@0.1.3
  - @backstage-community/plugin-announcements-react@0.1.3

## 0.1.3

### Patch Changes

- d08164d: Exported missing items to match documentation

## 0.1.2

### Patch Changes

- 126b459: Minor bump to fix release process - this should kick off the first release of the announcements plugins under the @backstage-community scope.
- Updated dependencies [126b459]
  - @backstage-community/plugin-announcements-common@0.1.2
  - @backstage-community/plugin-announcements-react@0.1.2

## 0.1.1

### Patch Changes

- 48094fc: Bump all dependencies to be in line with Backstage v1.34.2. This is the first versioned release of the announcement plugins under the `@backstage-community` scope.
- Updated dependencies [48094fc]
  - @backstage-community/plugin-announcements-common@0.1.1
  - @backstage-community/plugin-announcements-react@0.1.1
