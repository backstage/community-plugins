import { resolvePackagePath } from '@backstage/backend-common';
import { Knex } from 'knex';
import { Logger } from 'winston';
import path from 'path';
import dotenv from 'dotenv';

const ENTITY_APPLICATION_TABLE = 'entity-application-mapping';
const OAUTH_MAPPING_TABLE = 'oauth-mapping';

// Load environment variables
dotenv.config();

// Define default plugin root path using APP_ROOT if available
const defaultPluginRoot = path.join(
  process.env.APP_ROOT || '/opt/app-root', // Fallback to a hardcoded default if APP_ROOT is not set
  'src',
  'dynamic-plugins-root',
  'internal-backstage-plugin-mta-backend-dynamic-0.1.0',
);

// Check if running in development environment
const isDevelopment = process.env.NODE_ENV === 'development';

// Determine the plugin root directory based on environment
const pluginRoot = isDevelopment
  ? resolvePackagePath('@internal/backstage-plugin-mta-backend')
  : process.env.PLUGIN_ROOT || defaultPluginRoot;

console.log('Resolving path for migrations...');
const migrationsDir = path.join(pluginRoot, 'migrations');
console.log(`Using plugin root directory: ${pluginRoot}`);
console.log(`Migrations directory resolved to: ${migrationsDir}`);

export interface EntityApplicationStorage {
  getAllEntities(): Promise<any[]>;
  getApplicationIDForEntity(entityUID: string): Promise<Number | undefined>;
  saveApplicationIDForEntity(
    entityID: string,
    applicationID: string,
  ): Promise<Boolean | void>;
  saveRefreshTokenForUser(
    backstageID: string,
    refreshToken: string,
  ): Promise<Boolean | undefined>;
  getRefreshTokenForUser(backstageID: string): Promise<String | undefined>;
}

export class DataBaseEntityApplicationStorage
  implements EntityApplicationStorage
{
  public constructor(
    private readonly knex: Knex<any, any[]>,
    private readonly logger: Logger,
  ) {}

  static async create(
    knex: Knex<any, any[]>,
    logger: Logger,
  ): Promise<EntityApplicationStorage> {
    logger.info('Starting to migrate database');
    await knex.migrate.latest({
      directory: migrationsDir,
    });

    return new DataBaseEntityApplicationStorage(knex, logger);
  }

  async getAllEntities(): Promise<any[]> {
    return this.knex.table(ENTITY_APPLICATION_TABLE).select('*');
  }

  async getApplicationIDForEntity(
    entityUID: string,
  ): Promise<Number | undefined> {
    if (!entityUID) {
      return undefined;
    }
    const v: number = await this.knex
      .table(ENTITY_APPLICATION_TABLE)
      .where({ entityUID: entityUID })
      .first()
      .then(data => {
        if (!data) {
          return undefined;
        }
        console.log(data.mtaApplication);
        return data.mtaApplication;
      });
    return v;
  }

  async saveApplicationIDForEntity(
    entityID: string,
    applicationID: string,
  ): Promise<Boolean | void> {
    // this.logger.info('saving in storage: ' + entityID + ' ' + applicatonID);
    this.logger.info(`saving in storage: ${entityID} ${applicationID}`);

    if (!entityID || !applicationID) {
      return undefined;
    }
    const res = this.knex
      .insert({ entityUID: entityID, mtaApplication: applicationID })
      .into(ENTITY_APPLICATION_TABLE)
      .then(data => {
        if (data.length === 1) {
          return true;
        }
        return false;
      });
    return res;
  }

  async saveRefreshTokenForUser(
    backstageID: string,
    refreshToken: string,
  ): Promise<Boolean | undefined> {
    if (!backstageID || !refreshToken) {
      return undefined;
    }
    const r = await this.getRefreshTokenForUser(backstageID);

    if (r && r !== refreshToken) {
      const res = await this.knex
        .table(OAUTH_MAPPING_TABLE)
        .update({ mtaOAuthRefreshToken: refreshToken })
        .where('backstageID', backstageID)
        .then(data => {
          if (data === 1) {
            return true;
          }
          return false;
        });
      return res;
    }

    const res = this.knex
      .insert({ backstageID: backstageID, mtaOAuthRefreshToken: refreshToken })
      .into(OAUTH_MAPPING_TABLE)
      .then(data => {
        if (data.length === 1) {
          return true;
        }
        return false;
      });
    return res;
  }

  async getRefreshTokenForUser(
    backstageID: string,
  ): Promise<String | undefined> {
    if (!backstageID) {
      return undefined;
    }

    const v: string = await this.knex
      .table(OAUTH_MAPPING_TABLE)
      .where({ backstageID: backstageID })
      .first()
      .then(data => {
        if (!data) {
          return undefined;
        }
        return data.mtaOAuthRefreshToken;
      });
    return v;
  }
}
