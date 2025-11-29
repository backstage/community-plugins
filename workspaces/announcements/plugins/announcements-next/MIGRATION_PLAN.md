# Announcements Plugin Migration Plan

## Overview

The `announcements-next` plugin is a rewrite of the `announcements` plugin using the new frontend system and `@backstage/ui`. This plan identifies and addresses all missing functionality that needs to be migrated, while documenting deprecated features that will not be migrated.

## Deprecation Notice

The following features from the original `announcements` plugin are **deprecated** and will **not** be migrated to `announcements-next`:

1. **Standalone Create Page** (`/create`) - Create functionality is now exclusively available in the admin portal at `/admin`
2. **Standalone Edit Page** (`/edit/:id`) - Edit functionality is now exclusively available in the admin portal at `/admin`
3. **Standalone Categories Page** (`/categories`) - Category management is now exclusively available in the admin portal at `/admin/categories`
4. **Standalone Tags Page** (`/tags`) - Tag management is now exclusively available in the admin portal at `/admin/tags`

**Rationale**: The admin portal provides a unified interface for all administrative tasks (announcements, categories, and tags), eliminating the need for separate standalone pages. This simplifies the user experience and reduces code duplication.

**Migration Path**: Users of the original plugin should update their navigation and links to point to the admin portal routes instead of the deprecated standalone pages.

## Implementation Checklist

- [ ] **Routes:** Add `announcementViewRouteRef` to `routes.ts` and update `AnnouncementsRouter` with view route (skip deprecated create/edit/categories/tags routes)
- [ ] **Pages:** Implement `AnnouncementPage` component (view page only) using `@backstage/ui` – skip deprecated standalone pages (handled by admin portal)
- [ ] **Extensions:** Create all missing extensions: entityCards, navItems, search (result list item + filter), and banner extensions
- [ ] **Components Timeline:** Implement `AnnouncementsTimeline` component using `@backstage/ui`
- [ ] **Components Card:** Implement `AnnouncementsCard` component using `@backstage/ui` with last seen tracking and analytics
- [ ] **Components Banner:** Implement `NewAnnouncementBanner` component using `@backstage/ui` with signal integration and last seen tracking
- [ ] **Components Search:** Implement `AnnouncementSearchResultListItem` component using `@backstage/ui`
- [ ] **Markdown Renderer:** Implement `MarkdownRenderer` component supporting both backstage and md-editor modes; integrate into `AnnouncementDetailDialog` and `AnnouncementPage`
- [ ] **Features:** Add analytics tracking, complete router props customization, and ensure all features match original plugin (except deprecated ones)
- [ ] **Plugin Integration:** Update `plugin.ts` to include all extensions and ensure proper exports in `index.ts` files

## Missing Functionality Analysis

### 1. Routes/Pages Missing

- **`/view/:id`** - Dedicated announcement view page (`AnnouncementPage`)
  - Currently: Announcements are viewed in a dialog
  - Needed: Full page view with markdown rendering support
  - Location: `announcements/src/components/AnnouncementPage/AnnouncementPage.tsx`

### 2. Extensions Missing

All extensions are defined in `announcements/src/alpha/` but missing from `announcements-next/src/extensions/`:

- **Entity Card Extension** (`entityAnnouncementsCard`)

  - Location: `announcements/src/alpha/entityCards.tsx`
  - Purpose: Display announcements on entity pages (components & systems)
  - Uses: `AnnouncementsCard` component

- **Nav Item Extension** (`announcementsNavItem`)

  - Location: `announcements/src/alpha/navItems.tsx`
  - Purpose: Add announcements link to navigation sidebar

- **Search Result List Item Extension** (`announcementsSearchResultListItem`)

  - Location: `announcements/src/alpha/search.tsx`
  - Purpose: Display announcements in search results
  - Uses: `AnnouncementSearchResultListItem` component

- **Search Filter Result Type Extension** (`announcementsSearchFilterResultType`)

  - Location: `announcements/src/alpha/search.tsx`
  - Purpose: Add announcements filter to search page

- **Banner Extension** (`announcementsBanner`)
  - Location: `announcements/src/alpha/banner.tsx`
  - Purpose: Display new announcements as app-wide banner
  - Uses: `NewAnnouncementBanner` component

### 3. Components Missing

- **`AnnouncementsTimeline`**

  - Location: `announcements/src/components/AnnouncementsTimeline/AnnouncementsTimeline.tsx`
  - Purpose: Display announcements in timeline format
  - Props: maxResults, timelineAlignment, hideInactive, sortBy, order, current

- **`AnnouncementsCard`**

  - Location: `announcements/src/components/AnnouncementsCard/AnnouncementsCard.tsx`
  - Purpose: Display latest announcements in a card (for entity pages/homepage)
  - Props: title, max, category, active, variant, sortBy, order, current, hideStartAt

- **`NewAnnouncementBanner`**

  - Location: `announcements/src/components/NewAnnouncementBanner/NewAnnouncementBanner.tsx`
  - Purpose: Display banner for new/unseen announcements
  - Props: variant, max, category, active, current, tags, sortBy, cardOptions
  - Features: Signal-based updates, last seen tracking, analytics

- **`AnnouncementSearchResultListItem`**

  - Location: `announcements/src/components/AnnouncementSearchResultListItem/AnnouncementSearchResultListItem.tsx`
  - Purpose: Render announcement search results
  - Features: Highlighting, relative dates, translations

- **`MarkdownRenderer`**
  - Location: `announcements/src/components/MarkdownRenderer/MarkdownRenderer.tsx`
  - Purpose: Render markdown content with two modes (backstage/md-editor)
  - Currently: Commented out in `AnnouncementsPage.tsx` (line 44)

### 4. Features Missing

- **Markdown Renderer Support**

  - Currently commented out in `AnnouncementsPage.tsx`
  - Need to implement `MarkdownRenderer` component using `@backstage/ui` components
  - Support both 'backstage' and 'md-editor' modes

- **Router Props Customization**

  - Missing props: `themeId`, `subtitle`, `cardOptions`, `buttonOptions`
  - Partially implemented: `category`, `hideContextMenu`, `hideInactive`, `hideStartAt`, `markdownRenderer`, `defaultInactive`
  - Location: `announcements-next/src/router/AnnouncementsRouter.tsx`

- **Route Refs**

  - Missing route ref: `announcementViewRouteRef`
  - Location: `announcements-next/src/router/routes.ts`

- **Analytics Integration**

  - Missing: Analytics tracking for views/clicks in various components
  - Needed in: AnnouncementPage, AnnouncementsCard, NewAnnouncementBanner

- **Last Seen Tracking**

  - Missing: `markLastSeenDate` and `lastSeenDate` functionality
  - Needed for: NewAnnouncementBanner, AnnouncementsCard

- **Signal Integration**
  - Missing: Real-time updates via signals for new announcements
  - Needed in: NewAnnouncementBanner component

## Implementation Plan

### Phase 1: Core Routes and Pages

1. Add `announcementViewRouteRef` to `routes.ts`
2. Implement `AnnouncementPage` component (view page)
3. Update `AnnouncementsRouter` with view route
4. **Skip**: CreateAnnouncementPage, EditAnnouncementPage, CategoriesPage, TagsPage (deprecated - handled by admin portal)

### Phase 2: Extensions

1. Create `extensions/entityCards.tsx` for entity card extension
2. Create `extensions/navItems.tsx` for nav item extension
3. Create `extensions/search.tsx` for search extensions
4. Create `extensions/banner.tsx` for banner extension
5. Update `extensions/index.ts` to export all extensions
6. Update `plugin.ts` to include all extensions

### Phase 3: Reusable Components

1. Implement `AnnouncementsTimeline` component using `@backstage/ui`
2. Implement `AnnouncementsCard` component using `@backstage/ui`
3. Implement `NewAnnouncementBanner` component using `@backstage/ui`
4. Implement `AnnouncementSearchResultListItem` component using `@backstage/ui`
5. Implement `MarkdownRenderer` component using `@backstage/ui`

### Phase 4: Features and Polish

1. Implement markdown renderer support in `AnnouncementDetailDialog` and `AnnouncementPage`
2. Add analytics tracking to all components
3. Implement last seen tracking functionality
4. Add signal integration for real-time updates
5. Complete router props customization
6. Add comprehensive tests

### Phase 5: Documentation and Cleanup

1. Update README with all new features and deprecation notice
2. Add migration guide documenting deprecated features
3. Update API documentation
4. Remove commented code
5. Ensure all TypeScript types are exported

## Key Files to Modify/Create

### Routes

- `announcements-next/src/router/routes.ts` - Add `announcementViewRouteRef` only
- `announcements-next/src/router/AnnouncementsRouter.tsx` - Add view route

### Extensions

- `announcements-next/src/extensions/entityCards.tsx` - NEW
- `announcements-next/src/extensions/navItems.tsx` - NEW
- `announcements-next/src/extensions/search.tsx` - NEW
- `announcements-next/src/extensions/banner.tsx` - NEW
- `announcements-next/src/extensions/index.ts` - Update exports
- `announcements-next/src/plugin.ts` - Add all extensions

### Components

- `announcements-next/src/components/AnnouncementPage/` - NEW directory (view page only)
- `announcements-next/src/components/AnnouncementsTimeline/` - NEW directory
- `announcements-next/src/components/AnnouncementsCard/` - NEW directory
- `announcements-next/src/components/NewAnnouncementBanner/` - NEW directory
- `announcements-next/src/components/AnnouncementSearchResultListItem/` - NEW directory
- `announcements-next/src/components/MarkdownRenderer/` - NEW directory
- `announcements-next/src/components/AnnouncementsPage/AnnouncementDetailDialog.tsx` - Add markdown support
- `announcements-next/src/components/index.ts` - Update exports

### Utilities

- `announcements-next/src/components/utils.ts` - May need to add markdown/date utilities

## Dependencies to Add

- May need `@backstage/plugin-signals-react` for signal integration
- May need `@uiw/react-md-editor` for markdown editor mode (if not already present)
- Ensure `@backstage/plugin-permission-react` is available for permission checks

## Notes

- All new components should use `@backstage/ui` instead of Material-UI
- Maintain feature parity with original plugin (except for deprecated features)
- Admin portal already handles all CRUD operations for announcements, categories, and tags
- Backwards compatibility is not needed
- Follow Backstage new frontend system patterns
