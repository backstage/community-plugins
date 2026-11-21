/*
 * Copyright 2026 The Backstage Authors
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
import {
  DatabaseService,
  resolvePackagePath,
} from '@backstage/backend-plugin-api';
import { ConflictError, NotFoundError } from '@backstage/errors';
import type {
  MdxCardTemplate,
  MdxCardTemplateInput,
  MdxCardTemplateSummary,
} from '@backstage-community/plugin-mdx-card-common';
import { Knex } from 'knex';
import { z } from 'zod';

const TABLE = 'mdx_card_templates';

const migrationsDir = resolvePackagePath(
  '@backstage-community/plugin-mdx-card-backend',
  'migrations',
);

const dataFetchersSchema = z.array(
  z.object({ name: z.string(), pluginId: z.string(), apiUrl: z.string() }),
);

type TemplateRow = {
  id: string;
  title: string | null;
  template: string;
  data_fetchers: string;
  created_by: string;
  created_at: Date | string | number;
  updated_by: string;
  updated_at: Date | string | number;
};

const toIsoString = (value: Date | string | number) =>
  new Date(value).toISOString();

const toSummary = (
  row: Omit<TemplateRow, 'template' | 'data_fetchers'>,
): MdxCardTemplateSummary => ({
  id: row.id,
  ...(row.title ? { title: row.title } : {}),
  createdBy: row.created_by,
  createdAt: toIsoString(row.created_at),
  updatedBy: row.updated_by,
  updatedAt: toIsoString(row.updated_at),
});

const toTemplate = (row: TemplateRow): MdxCardTemplate => ({
  ...toSummary(row),
  template: row.template,
  dataFetchers: dataFetchersSchema.parse(JSON.parse(row.data_fetchers)),
});

/**
 * Stores MDX card templates in the plugin database.
 */
export class TemplateStore {
  static async create(database: DatabaseService): Promise<TemplateStore> {
    const client = await database.getClient();
    if (!database.migrations?.skip) {
      await client.migrate.latest({ directory: migrationsDir });
    }
    return new TemplateStore(client);
  }

  private constructor(private readonly db: Knex) {}

  async list(): Promise<MdxCardTemplateSummary[]> {
    const rows = await this.db<TemplateRow>(TABLE)
      .select(
        'id',
        'title',
        'created_by',
        'created_at',
        'updated_by',
        'updated_at',
      )
      .orderBy('id');
    return rows.map(toSummary);
  }

  async get(id: string): Promise<MdxCardTemplate> {
    const row = await this.db<TemplateRow>(TABLE).where({ id }).first();
    if (!row) {
      throw new NotFoundError(`No MDX card template with id "${id}"`);
    }
    return toTemplate(row);
  }

  async create(
    id: string,
    input: MdxCardTemplateInput,
    userRef: string,
  ): Promise<MdxCardTemplate> {
    const existing = await this.db<TemplateRow>(TABLE).where({ id }).first();
    if (existing) {
      throw new ConflictError(`MDX card template "${id}" already exists`);
    }
    const now = new Date();
    await this.db<TemplateRow>(TABLE).insert({
      id,
      title: input.title ?? null,
      template: input.template,
      data_fetchers: JSON.stringify(input.dataFetchers),
      created_by: userRef,
      created_at: now,
      updated_by: userRef,
      updated_at: now,
    });
    return this.get(id);
  }

  async update(
    id: string,
    input: MdxCardTemplateInput,
    userRef: string,
  ): Promise<MdxCardTemplate> {
    const updated = await this.db<TemplateRow>(TABLE)
      .where({ id })
      .update({
        title: input.title ?? null,
        template: input.template,
        data_fetchers: JSON.stringify(input.dataFetchers),
        updated_by: userRef,
        updated_at: new Date(),
      });
    if (updated === 0) {
      throw new NotFoundError(`No MDX card template with id "${id}"`);
    }
    return this.get(id);
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.db<TemplateRow>(TABLE).where({ id }).delete();
    if (deleted === 0) {
      throw new NotFoundError(`No MDX card template with id "${id}"`);
    }
  }
}
