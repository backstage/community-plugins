// code based on https://github.com/shailahir/backstage-plugin-shorturl-backend/
import { NotFoundError } from '@backstage/errors';
import { Knex } from 'knex';
import { ShortURLStore } from './ShortURLStore';
import {
  resolvePackagePath,
  DatabaseService,
} from '@backstage/backend-plugin-api';

const migrationsDir = resolvePackagePath(
  '@backstage-community/plugin-shorturl-backend',
  'migrations',
);

type Options = {
  database: DatabaseService;
};

/**
 * @public
 */
export type RawDbShortUrlRow = {
  short_id: string;
  full_url: string;
  usage_count: number;
};

/**
 * Store for short urls and full url mapping
 *
 * @public
 */
export class DatabaseHandler implements ShortURLStore {
  static async create(options: Options): Promise<DatabaseHandler> {
    const { database } = options;
    const client = await database.getClient();

    if (!database.migrations?.skip) {
      await client.migrate.latest({
        directory: migrationsDir,
      });
    }

    return new DatabaseHandler(client);
  }

  private constructor(private readonly db: Knex) {}

  async saveUrlMapping(options: {
    shortId: string;
    fullUrl: string;
    usageCount: number;
  }): Promise<void> {
    await this.db<RawDbShortUrlRow>('shorturl').insert({
      short_id: options.shortId,
      full_url: options.fullUrl,
      usage_count: options.usageCount,
    });
  }

  async getUrlById(options: { shortId: string }): Promise<{ fullUrl: string }> {
    const rowData = await this.db<RawDbShortUrlRow>('shorturl')
      .where({
        short_id: options.shortId,
      })
      .select(['full_url', 'usage_count']);

    if (!rowData.length) {
      throw new NotFoundError(`Unable to find the record`);
    }

    await this.db<RawDbShortUrlRow>('shorturl')
      .update({
        usage_count: +rowData[0]?.usage_count + 1,
      })
      .where({ short_id: options.shortId });

    return Promise.resolve({ fullUrl: rowData?.[0]?.full_url });
  }

  async getIdByUrl(options: { fullUrl: string }): Promise<{ shortId: string }> {
    const rowData = await this.db<RawDbShortUrlRow>('shorturl')
      .where({
        full_url: options.fullUrl,
      })
      .select(['short_id']);

    if (!rowData.length) {
      throw new NotFoundError(`Unable to find the record`);
    }

    return Promise.resolve({ shortId: rowData?.[0]?.short_id });
  }

  async getAllRecords(): Promise<
    [{ shortId: string; fullUrl: string; usageCount: number }]
  > {
    const rowData = await this.db<RawDbShortUrlRow>('shorturl').select([
      'short_id',
      'full_url',
      'usage_count',
    ]);

    return Promise.resolve(
      rowData as unknown as [
        { shortId: string; fullUrl: string; usageCount: number },
      ],
    );
  }
}
