# Announcements plugin for Backstage

The Announcements plugin is a frontend, backend, and common plugin that manages and displays announcements within Backstage.

This plugin provides:

- a component to display the latest announcements, for example on a homepage
- pages to list, view, create, edit and delete announcements
- integration with the [`@backstage/plugin-search`](https://github.com/backstage/backstage/tree/master/plugins/search) plugin
- integration with the [`@backstage/plugin-permission-backend`](https://github.com/backstage/backstage/tree/master/plugins/permission-backend) plugin

## Setup

See [the project's README](../../README.md).

## Permissions

This plugin provides the following permissions:

- `announcementCreatePermission`: creating new announcement
- `announcementDeletePermission`: deleting announcements
- `announcementUpdatePermission`: updating announcements

View [Backstage docs](https://backstage.io/docs/permissions/getting-started) to learn how to set up your instance of Backstage to use these permissions.
