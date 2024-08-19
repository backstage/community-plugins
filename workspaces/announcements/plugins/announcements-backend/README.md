# backstage-plugin-announcements-backend

This is the backend for the Announcements plugin. This plugin provides:

- REST APIs for managing announcements and categories
- Integration with the [`@backstage/plugin-search`](https://github.com/backstage/backstage/tree/master/plugins/search) plugin
- Integration with the [`@backstage/plugin-permission-backend`](https://github.com/backstage/backstage/tree/master/plugins/permission-backend) plugin

## Installation

Are you looking to install the announcements plugin? See the project's [installation guide](../../docs/index.md).

## Local development

### Setup

```sh
# install dependencies
yarn install

# start the backend
yarn start
```

### Database

The plugin includes a better-sqlite3 database seeded with categories and announcements.

With the backend running,

```sh
# runs migrations and seeds the database
yarn db:setup
```

This will create a `local.sqlite` file under the `db/` directory.

#### Other commands

```sh
# run migrations
yarn db:migrations

# seed the database
yarn db:seed
```

Visit [knexjs](https://knexjs.org/guide/migrations.html) to learn more about the database migrations and seeding.

### API Examples

```sh
# get all announcements
curl http://localhost:7007/api/announcements/announcements

# get all categories
curl http://localhost:7007/api/categories
```

```ts
// get all announcements
const response = await fetch(
  'http://localhost:7007/api/announcements/announcements',
);
const data = await response.json();
return data;
```
