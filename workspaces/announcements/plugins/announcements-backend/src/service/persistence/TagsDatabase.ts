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

export class TagsDatabase {
  constructor(private readonly db: Knex) {}

  async tags(): Promise<Tag[]> {
    return this.db('announcements_tags').select();
  }

  async insert(tag: Tag): Promise<void> {
    await this.db('announcements_tags').insert(tag);
  }

  async delete(slug: string): Promise<void> {
    await this.db('announcements_tags').where({ slug }).delete();
  }
}
