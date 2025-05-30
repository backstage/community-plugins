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
import { Knex } from 'knex';
import { DateTime } from 'luxon';
import { AnnouncementModel } from '../model';
import {
  AnnouncementsFilters,
  Announcement,
} from '@backstage-community/plugin-announcements-common';
import slugify from 'slugify';

const announcementsTable = 'announcements';

/**
 * @internal
 */
type AnnouncementUpsert = Omit<
  Announcement,
  'category' | 'created_at' | 'start_at'
> & {
  category?: string;
  created_at: DateTime;
  start_at: DateTime;
};

/**
 * @internal
 */
type DbAnnouncement = Omit<Announcement, 'category' | 'start_at'> & {
  category?: string;
  start_at: string;
};

/**
 * @internal
 */
type DbAnnouncementWithCategory = DbAnnouncement & {
  category_slug?: string;
  category_title?: string;
};

/**
 * @internal
 */
type AnnouncementModelsList = {
  count: number;
  results: AnnouncementModel[];
};

export const timestampToDateTime = (input: Date | string): DateTime => {
  if (typeof input === 'object') {
    return DateTime.fromJSDate(input).toUTC();
  }

  const result = input.includes(' ')
    ? DateTime.fromSQL(input, { zone: 'utc' })
    : DateTime.fromISO(input, { zone: 'utc' });
  if (!result.isValid) {
    throw new TypeError('Not valid');
  }

  return result;
};

/**
 * @internal
 */
const announcementUpsertToDB = (
  announcement: AnnouncementUpsert,
): DbAnnouncement => {
  return {
    id: announcement.id,
    category: announcement.category
      ? slugify(announcement.category, {
          lower: true,
        })
      : announcement.category,
    title: announcement.title,
    excerpt: announcement.excerpt,
    body: announcement.body,
    publisher: announcement.publisher,
    created_at: announcement.created_at.toSQL()!,
    active: announcement.active,
    start_at: announcement.start_at.toSQL()!,
    on_behalf_of: announcement.on_behalf_of,
  };
};

/**
 * @internal
 */
const DBToAnnouncementWithCategory = (
  announcementDb: DbAnnouncementWithCategory,
): AnnouncementModel => {
  return {
    id: announcementDb.id,
    category:
      announcementDb.category && announcementDb.category_title
        ? {
            slug: announcementDb.category,
            title: announcementDb.category_title,
          }
        : undefined,
    title: announcementDb.title,
    excerpt: announcementDb.excerpt,
    body: announcementDb.body,
    publisher: announcementDb.publisher,
    created_at: timestampToDateTime(announcementDb.created_at),
    active: announcementDb.active,
    start_at: timestampToDateTime(announcementDb.start_at),
    on_behalf_of: announcementDb.on_behalf_of,
  };
};

/**
 * Database implementation for announcements
 * @internal
 */
export class AnnouncementsDatabase {
  constructor(private readonly db: Knex) {}

  async announcements(
    request: AnnouncementsFilters,
  ): Promise<AnnouncementModelsList> {
    const {
      category,
      offset,
      max,
      active,
      sortBy = 'created_at',
      order = 'desc',
    } = request;

    // Filter the query by states
    // Used for both the result query and the count query
    const filterState = <TRecord extends {}, TResult>(
      qb: Knex.QueryBuilder<TRecord, TResult>,
    ) => {
      if (category) {
        qb.where('category', category);
      }
      if (active) {
        qb.where('active', active);
      }
    };

    // Filter the page (offset + max). Used only for the result query
    const filterRange = <TRecord extends {}, TResult>(
      qb: Knex.QueryBuilder<TRecord, TResult>,
    ) => {
      if (offset) {
        qb.offset(offset);
      }
      if (max) {
        qb.limit(max);
      }
    };

    const queryBuilder = this.db<DbAnnouncementWithCategory>(announcementsTable)
      .select(
        'id',
        'publisher',
        'announcements.title',
        'excerpt',
        'body',
        'category',
        'created_at',
        'categories.title as category_title',
        'active',
        'start_at',
        'on_behalf_of',
      )
      .orderBy(sortBy, order)
      .leftJoin('categories', 'announcements.category', 'categories.slug');
    filterState(queryBuilder);
    filterRange(queryBuilder);
    const results = (await queryBuilder.select()).map(
      DBToAnnouncementWithCategory,
    );

    const countQueryBuilder = this.db<DbAnnouncement>(announcementsTable).count<
      Record<string, number>
    >('id', { as: 'total' });
    filterState(countQueryBuilder);
    const countResult = await countQueryBuilder.first();
    const count =
      countResult && countResult.total
        ? parseInt(countResult.total.toString(), 10)
        : 0;

    return {
      count,
      results,
    };
  }

  async announcementByID(id: string): Promise<AnnouncementModel | undefined> {
    const dbAnnouncement: DbAnnouncementWithCategory =
      await this.db<DbAnnouncementWithCategory>(announcementsTable)
        .select(
          'id',
          'publisher',
          'announcements.title',
          'excerpt',
          'body',
          'category',
          'created_at',
          'categories.title as category_title',
          'active',
          'start_at',
          'on_behalf_of',
        )
        .leftJoin('categories', 'announcements.category', 'categories.slug')
        .where('id', id)
        .first();
    if (!dbAnnouncement) {
      return undefined;
    }

    return DBToAnnouncementWithCategory(dbAnnouncement);
  }

  async deleteAnnouncementByID(id: string): Promise<void> {
    return this.db<DbAnnouncement>(announcementsTable).where('id', id).delete();
  }

  async insertAnnouncement(
    announcement: AnnouncementUpsert,
  ): Promise<AnnouncementModel> {
    await this.db<DbAnnouncement>(announcementsTable).insert(
      announcementUpsertToDB(announcement),
    );

    const newAnnouncement = await this.announcementByID(announcement.id);

    if (!newAnnouncement) {
      throw new Error('Failed to insert announcement');
    }

    return newAnnouncement;
  }

  async updateAnnouncement(
    announcement: AnnouncementUpsert,
  ): Promise<AnnouncementModel> {
    await this.db<DbAnnouncement>(announcementsTable)
      .where('id', announcement.id)
      .update(announcementUpsertToDB(announcement));

    return (await this.announcementByID(announcement.id))!;
  }
}
