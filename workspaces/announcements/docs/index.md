# Getting started

## Installation

- [Plugin setup](setup.md)

## Usage

- [Integration with `@backstage/plugin-search`](search.md)

## Components

- [Display latest announcements on a page](latest-announcements-on-page.md)
- [Display a banner for the latest announcement](latest-announcement-banner.md)
- [Display announcements in a timeline](announcement-timeline.md)

## Customization

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

It is possible to specify the Announcements within a specific category rendered on the `AnnouncementsPage`. You can do this by passing a `category` prop to the `AnnouncementsPage` component. The `AnnouncementsPage` prop accepts an value such as:

```ts
category = 'conferences';
```

Example

```tsx
<AnnouncementsPage category="conferences" />
```

### Overriding the AnnouncementCreateButton

It is possible to specify the text for the "New announcement" button rendered on the `AnnouncementsPage`. You can do this by passing a `buttonOptions` prop to the `AnnouncementsPage` component. The `buttonOptions` prop accepts an object with the following properties:

```ts
{
  name: string; // defaults to 'announcement'
}
```
