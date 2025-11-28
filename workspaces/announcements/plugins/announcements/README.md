# announcements

The frontend for the Announcements plugin.

## Table of Contents

- [Installation](#installation)
- [New Frontend System (Alpha)](#new-frontend-system-alpha)
- [Components](#components)
- [Customization](#customization)

## Installation

Add the plugin to your frontend app

```bash
yarn --cwd packages/app add @backstage-community/plugin-announcements
```

Expose the announcements page:

```tsx
// packages/app/src/App.tsx
import { AnnouncementsPage } from '@backstage-community/plugin-announcements';

// ...

const AppRoutes = () => (
  <FlatRoutes>
    // ...
    <Route path="/announcements" element={<AnnouncementsPage />} />
    <Route path="/announcements/admin" element={<AdminPortal />} />
    // ...
  </FlatRoutes>
);
```

Viewing announcements is now available at `/announcements`. Managing announcements, categories and tags is now available at `/announcements/admin`. The admin portal is also available via the context menu on the announcements page.

### New Frontend System (Alpha)

Add the plugin to your frontend app:

```bash
yarn --cwd packages/app add @backstage-community/plugin-announcements
```

Add the plugin to `packages/app/src/App.tsx`:

```tsx
import announcementsPlugin from '@backstage-community/plugin-announcements/alpha';

// ...

const app = createApp({
  // ...
  features: [
    // ...
    announcementsPlugin,
    // ...
  ],
  // ...
});
```

Add the extensions in `app-config.yaml`:

```yaml
app:
  extensions:
    - entity-card:announcements/announcements
    - nav-item:announcements
```

The entity card will only appear on components & systems by default, but you can override that
behavior by passing a filter into the card extension like so:

```yaml
app:
  extensions:
    - entity-card:announcements/announcements:
        config:
          filter: kind:component,system,group,api
```

## Components

- Page to view announcements
- Unified admin portal to manage announcements, categories and tags
- [Display latest announcements on a page](./docs/latest-announcements-on-page.md)
- [Display a banner for the latest announcement](./docs/latest-announcement-banner.md)
- [Display announcements in a timeline](./docs/announcement-timeline.md)

## Customization

### Defaulting new announcements to inactive

It is possible to set the initial value of the `active` switch, displayed in the new announcement form, as false by passing a `defaultInactive` prop to the `AnnouncementsPage`.

```ts
<AnnouncementsPage defaultInactive />
```

### Overriding the AnnouncementCard

It is possible to specify the length of the title for announcements rendered on the `AnnouncementsPage`. You can do this by passing a `cardOptions` prop to the `AnnouncementsPage` component. The `cardOptions` prop accepts an object with the following properties:

```ts
{
  titleLength: number; // defaults to 50
}
```

Example

```tsx
<AnnouncementsPage cardOptions={{ titleLength: 10 }} />
```

### Overriding the AnnouncementsPage

It is possible to specify the Announcements within a specific category or tags rendered on the `AnnouncementsPage`. You can do this by passing a `category` or `tags` prop to the `AnnouncementsPage` component. The `AnnouncementsPage` prop accepts a value such as:

```ts
category = 'conferences';
```

Example

```tsx
<AnnouncementsPage category="conferences" />
```

### Overriding the NewAnnouncementBanner

It is possible to specify the length of the title for announcements rendered on the `NewAnnouncementBanner`. You can do this by passing a `cardOptions` prop to the `NewAnnouncementBanner` component. The `cardOptions` prop accepts an object with the following properties:

```ts
{
  titleLength: number; // defaults to 50
  excerptLength: number; // defaults to 50
}
```

Example

```tsx
<NewAnnouncementBanner cardOptions={{ titleLength: 10 }} />
```

### Markdown rendering

The plugin supports two different markdown rendering options:

1. **backstage** (default): Uses Backstage's built-in `MarkdownContent` component. This ensures compatibility with Backstage theming but may support a more limited set of markdown features.

2. **md-editor**: Uses `MDEditor.Markdown` which provides more complete markdown rendering with WYSIWYG-like results. However, it might not render correctly if your Backstage instance has custom theming applied.

You can select the markdown renderer when using the AnnouncementsPage component:

```tsx
<AnnouncementsPage markdownRenderer="backstage" /> // Default option
// or
<AnnouncementsPage markdownRenderer="md-editor" /> // Full markdown support
```

Select the renderer that best fits your needs based on whether theme consistency or markdown feature completeness is more important for your use case.

## Previously maintained by

- [procore-oss](https://github.com/procore-oss/backstage-plugin-announcements/tree/main/plugins/announcements)
- [k-phoen](https://github.com/K-Phoen/backstage-plugin-announcements/tree/main/plugins/announcements)
