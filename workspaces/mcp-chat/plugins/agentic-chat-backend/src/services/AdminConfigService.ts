/*
 * Copyright 2025 The Backstage Authors
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

import type {
  LoggerService,
  DatabaseService,
} from '@backstage/backend-plugin-api';
import { InputError } from '@backstage/errors';
import type { AdminConfigKey } from '@backstage-community/plugin-agentic-chat-common';
import {
  isProviderScopedKey,
  scopedConfigKey,
} from '@backstage-community/plugin-agentic-chat-common';
import type { ProviderType } from '@backstage-community/plugin-agentic-chat-common';
import { toErrorMessage } from './utils';

const TABLE_NAME = 'agentic_chat_admin_config';

const ALLOWED_KEYS: ReadonlySet<AdminConfigKey> = new Set([
  'activeProvider',
  'swimLanes',
  'systemPrompt',
  'branding',
  'safetyPatterns',
  'vectorStoreConfig',
  'activeVectorStoreIds',
  'model',
  'baseUrl',
  'toolChoice',
  'enableWebSearch',
  'enableCodeInterpreter',
  'mcpServers',
  'disabledMcpServerIds',
  'mcpProxyUrl',
  'safetyEnabled',
  'inputShields',
  'outputShields',
  'safetyOnError',
  'evaluationEnabled',
  'scoringFunctions',
  'minScoreThreshold',
  'evaluationOnError',
]);

interface AdminConfigRow {
  config_key: string;
  config_value: string;
  updated_at: string;
  updated_by: string;
}

/**
 * Manages admin-configurable settings in the database.
 * Provides a key-value store where values are JSON-serialized.
 *
 * The config loading precedence is:
 *   1. DB entry (admin override via UI)
 *   2. YAML config (app-config.yaml fallback)
 *
 * "Reset to Defaults" deletes the DB entry, reverting to YAML.
 */
export class AdminConfigService {
  private readonly logger: LoggerService;
  private db: Awaited<ReturnType<DatabaseService['getClient']>> | null = null;

  constructor(
    private readonly database: DatabaseService,
    logger: LoggerService,
  ) {
    this.logger = logger;
  }

  async initialize(): Promise<void> {
    try {
      const db = await this.database.getClient();
      this.db = db;

      const hasTable = await db.schema.hasTable(TABLE_NAME);
      if (!hasTable) {
        try {
          await db.schema.createTable(TABLE_NAME, table => {
            table.string('config_key').primary().notNullable();
            table.text('config_value').notNullable();
            table.timestamp('updated_at').notNullable().defaultTo(db.fn.now());
            table.string('updated_by').notNullable();
          });
          this.logger.info(`Created ${TABLE_NAME} table`);
        } catch (createError) {
          // Another instance may have created the table concurrently.
          // Verify it actually exists now before propagating the error.
          const existsNow = await db.schema.hasTable(TABLE_NAME);
          if (!existsNow) {
            throw createError;
          }
          this.logger.info(
            `${TABLE_NAME} table was created by another instance`,
          );
        }
      }
      await this.migrateFlatToScopedKeys();
    } catch (error) {
      const msg = toErrorMessage(error, 'Unknown database error');
      this.logger.error(`Failed to initialize AdminConfigService: ${msg}`);
      throw error;
    }
  }

  /**
   * One-time migration: move flat provider-scoped keys to namespaced format.
   *
   * For backward compatibility, if legacy flat keys exist (e.g., `model`
   * without a `::` prefix), they are copied to `llamastack::model` and
   * the flat key is deleted. This is idempotent and safe across concurrent
   * instances (uses the presence of the flat key as the migration trigger).
   */
  private async migrateFlatToScopedKeys(): Promise<void> {
    const MIGRATION_KEYS = [
      'model',
      'baseUrl',
      'toolChoice',
      'enableWebSearch',
      'enableCodeInterpreter',
      'safetyEnabled',
      'inputShields',
      'outputShields',
      'safetyOnError',
      'evaluationEnabled',
      'scoringFunctions',
      'minScoreThreshold',
      'evaluationOnError',
      'vectorStoreConfig',
      'activeVectorStoreIds',
    ] as const;

    const DEFAULT_PROVIDER: ProviderType = 'llamastack';
    let migrated = 0;

    for (const key of MIGRATION_KEYS) {
      const flatValue = await this.getRawValue(key);
      if (flatValue === undefined) continue;

      const scopedKey = scopedConfigKey(DEFAULT_PROVIDER, key);
      const alreadyScoped = await this.getRawValue(scopedKey);

      if (alreadyScoped === undefined) {
        await this.setRawValue(scopedKey, flatValue, 'system:migration');
      }

      await this.deleteRawValue(key);
      migrated++;
    }

    if (migrated > 0) {
      this.logger.info(
        `Migrated ${migrated} flat config key(s) to provider-scoped format (${DEFAULT_PROVIDER}::*)`,
      );
    }
  }

  /**
   * Validates that a key is in the allowed set.
   * Throws InputError for invalid keys.
   */
  static validateKey(key: string): AdminConfigKey {
    if (!ALLOWED_KEYS.has(key as AdminConfigKey)) {
      throw new InputError(
        `Invalid config key: "${key}". Allowed keys: ${[...ALLOWED_KEYS].join(
          ', ',
        )}`,
      );
    }
    return key as AdminConfigKey;
  }

  private ensureInitialized(): void {
    if (!this.db) {
      throw new Error('AdminConfigService not initialized');
    }
  }

  private getDb(): NonNullable<typeof this.db> {
    this.ensureInitialized();
    if (!this.db) {
      throw new Error('AdminConfigService not initialized');
    }
    return this.db;
  }

  /**
   * Get a config value by key. Returns undefined if not set in DB.
   */
  async get(key: AdminConfigKey): Promise<unknown | undefined> {
    AdminConfigService.validateKey(key);

    const row = await this.getDb()<AdminConfigRow>(TABLE_NAME)
      .where('config_key', key)
      .first();

    if (!row) {
      return undefined;
    }

    try {
      return JSON.parse(row.config_value);
    } catch {
      this.logger.warn(
        `Corrupt JSON in admin config for key "${key}", ignoring`,
      );
      return undefined;
    }
  }

  /**
   * Get a config entry with metadata. Returns undefined if not set in DB.
   */
  async getEntry(key: AdminConfigKey): Promise<
    | {
        configKey: AdminConfigKey;
        configValue: unknown;
        updatedAt: string;
        updatedBy: string;
      }
    | undefined
  > {
    AdminConfigService.validateKey(key);

    const row = await this.getDb()<AdminConfigRow>(TABLE_NAME)
      .where('config_key', key)
      .first();

    if (!row) {
      return undefined;
    }

    try {
      return {
        configKey: row.config_key as AdminConfigKey,
        configValue: JSON.parse(row.config_value),
        updatedAt: row.updated_at,
        updatedBy: row.updated_by,
      };
    } catch {
      this.logger.warn(
        `Corrupt JSON in admin config for key "${key}", ignoring`,
      );
      return undefined;
    }
  }

  /**
   * Set a config value. Uses an atomic upsert to avoid race conditions
   * when multiple admin requests target the same key concurrently.
   */
  async set(
    key: AdminConfigKey,
    value: unknown,
    updatedBy: string,
  ): Promise<void> {
    AdminConfigService.validateKey(key);

    if (value === undefined) {
      throw new InputError(
        `Cannot set config key "${key}" to undefined. Use delete() to revert to defaults.`,
      );
    }

    const serialized = JSON.stringify(value);
    const now = new Date().toISOString();
    const row: AdminConfigRow = {
      config_key: key,
      config_value: serialized,
      updated_at: now,
      updated_by: updatedBy,
    };

    await this.getDb()<AdminConfigRow>(TABLE_NAME)
      .insert(row)
      .onConflict('config_key')
      .merge({
        config_value: serialized,
        updated_at: now,
        updated_by: updatedBy,
      });

    this.logger.info(`Admin config "${key}" updated by ${updatedBy}`);
  }

  /**
   * Delete a config entry (revert to YAML defaults).
   * Returns true if a row was deleted, false if key was not in DB.
   */
  async delete(key: AdminConfigKey): Promise<boolean> {
    AdminConfigService.validateKey(key);

    const deleted = await this.getDb()<AdminConfigRow>(TABLE_NAME)
      .where('config_key', key)
      .delete();

    if (deleted > 0) {
      this.logger.info(`Admin config "${key}" reset to defaults`);
      return true;
    }
    return false;
  }

  /**
   * List all admin config entries.
   */
  async listAll(): Promise<
    Array<{ configKey: AdminConfigKey; updatedAt: string; updatedBy: string }>
  > {
    const rows = await this.getDb()<AdminConfigRow>(TABLE_NAME)
      .select('config_key', 'updated_at', 'updated_by')
      .orderBy('config_key');

    return rows.map(row => ({
      configKey: row.config_key as AdminConfigKey,
      updatedAt: row.updated_at,
      updatedBy: row.updated_by,
    }));
  }

  // ---------------------------------------------------------------------------
  // Provider-scoped key helpers
  // ---------------------------------------------------------------------------

  /**
   * Resolve a config key to its storage key.
   *
   * Provider-scoped keys are stored as `<providerId>::<key>` in the database.
   * Global keys and `activeProvider` are stored as-is.
   *
   * @param key - The logical config key
   * @param providerId - The active provider ID for scoping
   * @returns The database storage key
   */
  resolveStorageKey(key: AdminConfigKey, providerId: ProviderType): string {
    if (key === 'activeProvider' || !isProviderScopedKey(key)) {
      return key;
    }
    return scopedConfigKey(providerId, key);
  }

  /**
   * Get a provider-scoped config value.
   *
   * @param key - The logical config key
   * @param providerId - The provider to read config for
   * @returns The stored value, or undefined if not set
   */
  async getScopedValue(
    key: AdminConfigKey,
    providerId: ProviderType,
  ): Promise<unknown | undefined> {
    const storageKey = this.resolveStorageKey(key, providerId);
    return this.getRawValue(storageKey);
  }

  /**
   * Set a provider-scoped config value.
   *
   * @param key - The logical config key
   * @param value - The value to store
   * @param providerId - The provider to store config for
   * @param updatedBy - User reference for audit
   */
  async setScopedValue(
    key: AdminConfigKey,
    value: unknown,
    providerId: ProviderType,
    updatedBy: string,
  ): Promise<void> {
    const storageKey = this.resolveStorageKey(key, providerId);
    await this.setRawValue(storageKey, value, updatedBy);
    this.logger.info(
      `Admin config "${key}" (scoped to ${providerId}) updated by ${updatedBy}`,
    );
  }

  /**
   * Delete a provider-scoped config value.
   *
   * @param key - The logical config key
   * @param providerId - The provider to delete config for
   * @returns true if a row was deleted
   */
  async deleteScopedValue(
    key: AdminConfigKey,
    providerId: ProviderType,
  ): Promise<boolean> {
    const storageKey = this.resolveStorageKey(key, providerId);
    return this.deleteRawValue(storageKey);
  }

  // ---------------------------------------------------------------------------
  // Raw (unvalidated key) database access — used for scoped keys and migration
  // ---------------------------------------------------------------------------

  /** @internal Read a raw key from the database. */
  async getRawValue(storageKey: string): Promise<unknown | undefined> {
    const row = await this.getDb()<AdminConfigRow>(TABLE_NAME)
      .where('config_key', storageKey)
      .first();

    if (!row) return undefined;

    try {
      return JSON.parse(row.config_value);
    } catch {
      this.logger.warn(
        `Corrupt JSON in admin config for key "${storageKey}", ignoring`,
      );
      return undefined;
    }
  }

  /** @internal Write a raw key to the database. */
  async setRawValue(
    storageKey: string,
    value: unknown,
    updatedBy: string,
  ): Promise<void> {
    const serialized = JSON.stringify(value);
    const now = new Date().toISOString();
    const row: AdminConfigRow = {
      config_key: storageKey,
      config_value: serialized,
      updated_at: now,
      updated_by: updatedBy,
    };

    await this.getDb()<AdminConfigRow>(TABLE_NAME)
      .insert(row)
      .onConflict('config_key')
      .merge({
        config_value: serialized,
        updated_at: now,
        updated_by: updatedBy,
      });
  }

  /** @internal Delete a raw key from the database. */
  async deleteRawValue(storageKey: string): Promise<boolean> {
    const deleted = await this.getDb()<AdminConfigRow>(TABLE_NAME)
      .where('config_key', storageKey)
      .delete();
    return deleted > 0;
  }
}
