# announcements

This is the frontend for the Announcements plugin. This plugin provides:

- a component to display the latest announcements, for example on a homepage
- pages to list, view, create, edit and delete announcements

## Installation

Add the plugin to your frontend app

```bash
yarn --cwd packages/app add @backstage-community/plugin-announcements
```

Expose the announcements page:

```ts
// packages/app/src/App.tsx
import { AnnouncementsPage } from '@backstage-community/plugin-announcements';

// ...

const AppRoutes = () => (
  <FlatRoutes>
    // ...
    <Route path="/announcements" element={<AnnouncementsPage />} />
    // ...
  </FlatRoutes>
);
```

An interface to create/update/edit/delete announcements is now available at `/announcements`.

## New Frontend System Setup (Alpha)

Add the plugin to your frontend app:

```bash
yarn --cwd packages/app add @backstage-community/plugin-announcements
```

Add the plugin to `packages/app/src/App.tsx`:

```ts
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

## Development

### Getting started

Your plugin has been added to the example app in this repository, meaning you'll be able to access it by running `yarn start` in the root directory, and then navigating to [/announcements](http://localhost:3000/announcements).

You can also serve the plugin in isolation by running `yarn start` in the plugin directory.
This method of serving the plugin provides quicker iteration speed and a faster startup and hot reloads.
It is only meant for local development, and the setup for it can be found inside the [/dev](./dev) directory.

## Previously maintained by

- [procore-oss](https://github.com/procore-oss/backstage-plugin-announcements/tree/main/plugins/announcements)
- [k-phoen](https://github.com/K-Phoen/backstage-plugin-announcements/tree/main/plugins/announcements)
