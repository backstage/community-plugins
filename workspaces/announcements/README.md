# Announcements plugin for Backstage

The Announcements plugin manages and displays announcements within Backstage.

## Plugins

This plugin is composed of several packages:

- [annoucements](./plugins/announcements/README.md) - The frontend plugin that provides the UI components and pages.
- [announcements-backend](./plugins/announcements-backend/README.md) - The backend plugin that provides the REST API and database model.
- [announcements-node](./plugins/announcements-node/README.md) - A node library containing reusable service logic.
- [announcements-common](./plugins/announcements-common/README.md) - A common library containing shared types and utilities.
- [announcements-react](./plugins/announcements-react/README.md) - A web library containing announcements-related react components.

## Quick start

You will find detailed installation instructions in each plugin's readme file.

```sh
# From your Backstage root directory
# install backend
yarn --cwd packages/backend add @backstage-community/plugin-announcements-backend

# install frontend
yarn --cwd packages/app add @backstage-community/plugin-announcements

# install search module
yarn --cwd packages/backend add @backstage-community/plugin-search-backend-module-announcements

# the announcements page will be available at /announcements
# see the READMEs in the frontend and backend plugin for more details
```

## How does it look?

### Latest announcement banner

![Latest announcement banner](./images/announcement_banner.png)

### Announcements card

![Announcements card](./images/announcements_card.png)

### Announcements page

![Announcements page](./images/announcements_page.png)

### Announcements search

![Announcements search results](./images/announcements_search.png)

### Admin Portal

![Announcements admin portal](./images/announcements_admin_portal.png)

## Previously maintained by

- [procore-oss](https://github.com/procore-oss/backstage-plugin-announcements)
- [K-Phoen](https://github.com/K-Phoen/backstage-plugin-announcements)
