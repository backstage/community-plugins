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

# set .env
cp env.sample .env
source .env

# start the backend
yarn start
```

### Database

The plugin includes support for postgres and better-sqlite3 databases. By default, the plugin uses a postgres database via docker-compose. Update the `app-config.yaml` to use the `better-sqlite3` database.

#### Postgres

The postgres database can be started with docker-compose. Don't forget to copy the `env.sample`.

```sh
# start the postgres database
docker-compose up -d

# stop the postgres database
docker-compose down -v
```

#### better-sqlite3

The better-sqlite3 database can be seeded with categories and announcements.

With the backend running,

```sh
# runs migrations and seeds the database
yarn db:setup

# or run them separately
yarn db:migrations
yarn db:seed
```

This will create a `local.sqlite` file under the `db/` directory.

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
