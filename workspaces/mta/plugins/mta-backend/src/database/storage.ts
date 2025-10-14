import { Knex } from 'knex';
import { LoggerService } from '@backstage/backend-plugin-api';
import { runEmbeddedMigrations } from './embedded-migrations';

const ENTITY_APPLICATION_TABLE = 'entity-application-mapping';
const OAUTH_MAPPING_TABLE = 'oauth-mapping';

export interface EntityApplicationStorage {
  getAllEntities(): Promise<any[]>;
  getApplicationIDForEntity(entityUID: string): Promise<number | undefined>;
  saveApplicationIDForEntity(
    entityID: string,
    applicationID: string,
  ): Promise<boolean | void>;
  saveRefreshTokenForUser(
    backstageID: string,
    refreshToken: string,
  ): Promise<boolean | undefined>;
  getRefreshTokenForUser(backstageID: string): Promise<string | undefined>;
  deleteRefreshTokenForUser(backstageID: string): Promise<boolean>;
}

export class DataBaseEntityApplicationStorage
  implements EntityApplicationStorage
{
  private constructor(
    private readonly knex: Knex<any, any[]>,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Create the storage instance and run migrations.
   */
  static async create(
    knex: Knex<any, any[]>,
    logger: LoggerService,
  ): Promise<EntityApplicationStorage> {
    logger.info('Starting to migrate database');

    // Use embedded migrations
    await runEmbeddedMigrations(knex, logger);

    return new DataBaseEntityApplicationStorage(knex, logger);
  }

  async getAllEntities(): Promise<any[]> {
    return this.knex.table(ENTITY_APPLICATION_TABLE).select('*');
  }

  async getApplicationIDForEntity(
    entityUID: string,
  ): Promise<number | undefined> {
    if (!entityUID) {
      return undefined;
    }
    return this.knex
      .table(ENTITY_APPLICATION_TABLE)
      .where({ entityUID })
      .first()
      .then(row => row?.mtaApplication);
  }

  async saveApplicationIDForEntity(
    entityID: string,
    applicationID: string,
  ): Promise<boolean | void> {
    this.logger.info(`saving in storage: ${entityID} ${applicationID}`);
    if (!entityID || !applicationID) {
      return undefined;
    }
    return this.knex
      .insert({ entityUID: entityID, mtaApplication: applicationID })
      .into(ENTITY_APPLICATION_TABLE)
      .then(data => data.length === 1);
  }

  async saveRefreshTokenForUser(
    backstageID: string,
    refreshToken: string,
  ): Promise<boolean | undefined> {
    if (!backstageID || !refreshToken) {
      return undefined;
    }

    try {
      // Use Knex's upsert functionality (works with SQLite, PostgreSQL, MySQL)
      await this.knex
        .insert({ backstageID, mtaOAuthRefreshToken: refreshToken })
        .into(OAUTH_MAPPING_TABLE)
        .onConflict('backstageID')
        .merge(['mtaOAuthRefreshToken']);

      return true;
    } catch (error: any) {
      this.logger.error(
        `Failed to save refresh token for user ${backstageID}:`,
        error,
      );
      throw error;
    }
  }

  async getRefreshTokenForUser(
    backstageID: string,
  ): Promise<string | undefined> {
    if (!backstageID) {
      return undefined;
    }
    return this.knex
      .table(OAUTH_MAPPING_TABLE)
      .where({ backstageID })
      .first()
      .then(row => row?.mtaOAuthRefreshToken);
  }

  async deleteRefreshTokenForUser(backstageID: string): Promise<boolean> {
    if (!backstageID) {
      return false;
    }
    const deleted = await this.knex
      .table(OAUTH_MAPPING_TABLE)
      .where({ backstageID })
      .del();
    return deleted > 0;
  }
}
