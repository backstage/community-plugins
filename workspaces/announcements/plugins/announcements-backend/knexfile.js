/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  development: {
    client: 'better-sqlite3',
    connection: {
      filename: './db/local.sqlite',
    },
    useNullAsDefault: true,
    seeds: {
      directory: './db/seeds',
    },
    migrations: {
      directory: './db/migrations',
    },
  },
};
