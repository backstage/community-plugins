# announcements-backend

The backend for the Announcements plugin. This plugin provides:

- REST APIs for managing announcements, categories, and tags
- Database model for storing announcements, categories, and tags
- Integration with the [`@backstage/plugin-search`](https://github.com/backstage/backstage/tree/master/plugins/search) plugin
- Integration with the [`@backstage/plugin-permission-backend`](https://github.com/backstage/backstage/tree/master/plugins/permission-backend) plugin
- Integration with the [`@backstage/plugin-events-backend`](https://github.com/backstage/backstage/tree/master/plugins/events-backend) plugin
- Integration with the [`@backstage/plugin-signals-backend`](https://github.com/backstage/backstage/tree/master/plugins/signals-backend) plugin
- Integration with the [`@backstage/notifications-backend`](https://github.com/backstage/backstage/tree/master/plugins/notifications-backend) plugin
- Integration with the [Auditor Service](https://backstage.io/docs/backend-system/core-services/auditor). Audit logging helps to track announcements creation, updates, and deletion.

## Table of contents

- [Installation](#installation)
- [API Examples](#api-examples)
- [Integrations](#integrations)
- [Local development](#local-development)
  - [Setup](#setup)
  - [Database](#database)
    - [Postgres](#postgres)
    - [Seeding the database](#seeding-the-database)

## Installation

To install it to your backend package, run the following command:

```bash
# From your root directory
yarn --cwd packages/backend add @backstage-community/plugin-announcements-backend
```

Then add the plugin to your backend in `packages/backend/src/index.ts`:

```ts
const backend = createBackend();
// ...
backend.add(import('@backstage-community/plugin-announcements-backend'));
```

## API examples

```sh
# get all announcements
curl http://localhost:7007/api/announcements/announcements

# get announcements for a specific entity
curl http://localhost:7007/api/announcements/announcements?entity_ref=component:default/my-service

# get all categories
curl http://localhost:7007/api/categories

# get all tags
curl http://localhost:7007/api/tags
```

```ts
// get all announcements
const response = await fetch(
  'http://localhost:7007/api/announcements/announcements',
);
const data = await response.json();
return data;

// get announcements for a specific entity
const response = await fetch(
  'http://localhost:7007/api/announcements/announcements?entity_ref=component:default/my-service',
);
const data = await response.json();
return data;
```

## Integrations

The announcements plugin integrates with the following Backstage plugins.

### Permission

View the [permission](../announcements-common/README.md#resources) documentation.

### Events

View the [events](../announcements-node/docs/events.md) documentation.

### Signals

View the [signals](../announcements-node/docs/signals.md) documentation.

### Notifications

Backstage's Notification System enables plugins and services to deliver real-time alerts to users, visible in the UI or via external channels. The announcements plugin can send a notification through the Notifications backend whenever an announcement is created. Announcement notifications are disabled by default and can be enabled via the `sendNotification` option when creating an announcement in the UI.

See the notifications [docs](https://backstage.io/docs/notifications/).

### Search

View the search module's [README](../search-backend-module-announcements/README.md).

## Local development

This plugin backend can be started in a standalone mode from directly in this
package with `yarn start`. It is a limited setup that is most convenient when
developing the plugin backend itself.

If you want to run the entire project, including the frontend, run `yarn start` from the root directory.

### Setup

```sh
# install dependencies
yarn install

# start the backend with in-memory database
yarn start
```

### Database

The plugin defaults to better-sqlite3 in the main `app-config.yaml`. If you want to use postgres, you can via docker-compose. We recommend you copy the `app-config.local.yaml.sample` to `app-config.local.yaml` and update the database configuration.

The postgres database can be seeded with categories, tags, and announcements.

#### Postgres

The postgres database can be started with docker-compose. You will need to copy the `env.sample` to `.env`, the `app-config.local.yaml.sample` to `app-config.local.yaml`.

```sh
# copy the env.sample to .env
cp env.sample .env

# copy the app-config.local.yaml.sample to app-config.local.yaml
cp app-config.local.yaml.sample app-config.local.yaml

# start the postgres database
docker-compose up -d

# stop the postgres database
docker-compose down -v

# start the backend with postgres database
yarn start
```

#### Seeding the database

The postgres database can be seeded with categories, tags, and announcements.

```sh
# initial or reset the database
yarn db:setup
```

```sh
# running migrations
yarn db:migrations

# seeding the database
yarn db:seed
```
