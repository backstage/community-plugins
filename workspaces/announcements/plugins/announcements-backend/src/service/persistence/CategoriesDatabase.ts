/*
 * Copyright 2024 The Backstage Authors
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
import { Category } from '@backstage-community/plugin-announcements-common';
import { Knex } from 'knex';

const categoriesTable = 'categories';

/**
 * Database implementation for categories
 *
 * @internal
 */
export class CategoriesDatabase {
  constructor(private readonly db: Knex) {}

  async categories(): Promise<Category[]> {
    const queryBuilder = this.db<Category>(categoriesTable).orderBy(
      'title',
      'asc',
    );

    return queryBuilder.select();
  }

  async delete(slug: string): Promise<void> {
    return this.db<Category>(categoriesTable).where('slug', slug).delete();
  }

  async insert(category: Category): Promise<void> {
    await this.db<Category>(categoriesTable).insert(category);
  }

  async update(category: Category): Promise<void> {
    await this.db<Category>(categoriesTable)
      .where('slug', category.slug)
      .update(category);
  }
}
