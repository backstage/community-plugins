/**
 * Embedded database migrations for MTA plugin
 * This eliminates the need for external migration files and complex path resolution
 */

import { Knex } from 'knex';

export const migrations = {
  '20240131_migration': {
    async up(knex: Knex): Promise<void> {
      await knex.schema.createTable('oauth-mapping', table => {
        table.string('backstageID').primary();
        table.text('mtaOAuthRefreshToken');
      });
      await knex.schema.createTable('entity-application-mapping', table => {
        table.string('entityUID').primary();
        table.integer('mtaApplication');
      });
    },
    async down(knex: Knex): Promise<void> {
      await knex.schema.dropTable('oauth-mapping');
      await knex.schema.dropTable('entity-application-mapping');
    },
  },
};

/**
 * Run embedded migrations
 */
export async function runEmbeddedMigrations(
  knex: Knex,
  logger: { info: (msg: string) => void },
): Promise<void> {
  // Check if migrations table exists
  const hasTable = await knex.schema.hasTable('knex_migrations');
  if (!hasTable) {
    await knex.schema.createTable('knex_migrations', table => {
      table.increments('id');
      table.string('name');
      table.integer('batch');
      table.timestamp('migration_time');
    });
  }

  // Get already run migrations
  const completedMigrations = await knex('knex_migrations')
    .select('name')
    .pluck('name');

  // Run pending migrations
  for (const [name, migration] of Object.entries(migrations)) {
    if (!completedMigrations.includes(name)) {
      logger.info(`Running migration: ${name}`);
      await migration.up(knex);
      await knex('knex_migrations').insert({
        name,
        batch: 1,
        migration_time: new Date(),
      });
    }
  }
}
