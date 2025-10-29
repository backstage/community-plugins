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
import { Knex } from 'knex';

export interface Tag {
  slug: string;
  title: string;
}

const tagsTable = 'tags';

/**
 * Database implementation for tags
 *
 * @internal
 */
export class TagsDatabase {
  constructor(private readonly db: Knex) {}

  async tags(): Promise<Tag[]> {
    return this.db<Tag>(tagsTable).orderBy('title', 'asc').select();
  }

  async tagBySlug(slug: string): Promise<Tag | undefined> {
    return this.db<Tag>(tagsTable).where('slug', slug).first();
  }

  async insert(tag: Tag): Promise<void> {
    await this.db<Tag>(tagsTable).insert(tag).onConflict('slug').ignore();
  }

  async update(tag: Tag): Promise<void> {
    await this.db<Tag>(tagsTable)
      .where('slug', tag.slug)
      .update({ title: tag.title });
  }

  async delete(slug: string): Promise<void> {
    try {
      const likePattern = `%"${slug}"%`;
      const countResult = await this.db('announcements')
        .whereRaw('CAST(tags AS TEXT) LIKE ?', [likePattern])
        .count('* as count')
        .first();

      const referencedCount = countResult
        ? parseInt(String(countResult.count), 10)
        : 0;

      if (referencedCount > 0) {
        throw new Error('Tag to delete is used in some announcements');
      }

      await this.db<Tag>(tagsTable).where('slug', slug).delete();
    } catch (error) {
      throw error;
    }
  }
}
