/*
 * Copyright 2021 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { TechInsightsDatabase } from './TechInsightsDatabase';
import { PersistenceContext } from '@backstage-community/plugin-tech-insights-node';
import {
  DatabaseService,
  LoggerService,
  resolvePackagePath,
} from '@backstage/backend-plugin-api';

const migrationsDir = resolvePackagePath(
  '@backstage-community/plugin-tech-insights-backend',
  'migrations',
);

/**
 * A Container for persistence context initialization options
 *
 * @public
 */
export type PersistenceContextOptions = {
  logger: LoggerService;
};

/**
 * Cache of `PersistenceContext` promises keyed by `DatabaseService`.
 *
 * Two service factories in this package — `techInsightsPlugin` and
 * `techInsightsFactInsertServiceFactory` — both initialize a persistence
 * context for the same plugin-scoped `DatabaseService`. Without this
 * cache they would each open their own Knex pool and race to run the
 * same migrations. Keying on the `DatabaseService` instance (which is
 * itself plugin-scoped) means the cache is implicitly scoped per-plugin
 * and is garbage collected when the backend shuts down.
 */
const persistenceContextCache = new WeakMap<
  DatabaseService,
  Promise<PersistenceContext>
>();

/**
 * A factory function to construct persistence context for running implementation.
 *
 * Memoized per `DatabaseService` instance: repeated calls with the same
 * database return the same `PersistenceContext` and run migrations
 * exactly once. A rejected initialization is purged from the cache so
 * the next caller can retry.
 *
 * @public
 */
export const initializePersistenceContext = async (
  database: DatabaseService,
  options: PersistenceContextOptions,
): Promise<PersistenceContext> => {
  const cached = persistenceContextCache.get(database);
  if (cached) {
    return cached;
  }

  const created = (async () => {
    const client = await database.getClient();

    if (!database.migrations?.skip) {
      await client.migrate.latest({
        directory: migrationsDir,
      });
    }

    return {
      techInsightsStore: new TechInsightsDatabase(client, options.logger),
    };
  })();

  persistenceContextCache.set(database, created);

  try {
    return await created;
  } catch (error) {
    // Don't keep a rejected promise in the cache — let the next caller retry.
    persistenceContextCache.delete(database);
    throw error;
  }
};
