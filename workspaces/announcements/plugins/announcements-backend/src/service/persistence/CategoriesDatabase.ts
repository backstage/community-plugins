import { Category } from '@backstage-community/plugin-announcements-common';
import { Knex } from 'knex';

const categoriesTable = 'categories';

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
