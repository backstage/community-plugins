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
  'category' | 'tags' | 'created_at' | 'start_at'
> & {
  category?: string;
  tags?: string[];
  created_at: DateTime;
  start_at: DateTime;
};

/**
 * @internal
 */
type DbAnnouncement = Omit<Announcement, 'category' | 'tags' | 'start_at'> & {
  category?: string;
  tags?: string | string[];
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
 * Parse tags from database string or array to string array
 * @internal
 */
const parseTagsFromDb = (
  tags: string | string[] | null | undefined,
): string[] => {
  if (!tags) return [];

  if (typeof tags === 'string') {
    try {
      const parsed = JSON.parse(tags);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return tags
        .replace(/^\{|\}$/g, '')
        .split(',')
        .map(tag => tag.trim())
        .filter(Boolean);
    }
  }

  return Array.isArray(tags) ? tags : [];
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
    tags:
      announcement.tags && announcement.tags.length > 0
        ? JSON.stringify(announcement.tags)
        : JSON.stringify([]),
  };
};

/**
 * @internal
 */
const DBToAnnouncementWithCategory = (
  announcementDb: DbAnnouncementWithCategory,
): AnnouncementModel => {
  const parsedTags = parseTagsFromDb(announcementDb.tags);

  return {
    id: announcementDb.id,
    category:
      announcementDb.category && announcementDb.category_title
        ? {
            slug: announcementDb.category,
            title: announcementDb.category_title,
          }
        : undefined,
    tags: parsedTags.map(tag => ({
      slug: tag,
      title: tag,
    })),
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
      tags,
      sortBy = 'created_at',
      order = 'desc',
    } = request;

    const filterState = <TRecord extends {}, TResult>(
      qb: Knex.QueryBuilder<TRecord, TResult>,
    ) => {
      if (category) {
        qb.where('category', category);
      }
      if (active) {
        qb.where('active', active);
      }
      if (tags?.length) {
        tags.forEach(tag => {
          const likePattern = `%"${tag}"%`;
          qb.whereRaw('CAST(tags AS TEXT) LIKE ?', [likePattern]);
        });
      }
    };

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
        'tags',
      )
      .orderBy(sortBy, order)
      .leftJoin('categories', 'announcements.category', 'categories.slug');
    filterState(queryBuilder);
    filterRange(queryBuilder);

    const announcementRows = await queryBuilder;

    const announcementsWithInitialTags = announcementRows.map(row =>
      DBToAnnouncementWithCategory(row),
    );

    const allTagSlugs = new Set<string>();
    announcementsWithInitialTags.forEach(announcement => {
      announcement.tags?.forEach(tag => {
        allTagSlugs.add(tag.slug);
      });
    });

    const tagSlugsArray = Array.from(allTagSlugs);
    const tagTitleMap = new Map<string, string>(); // slug -> title

    if (tagSlugsArray.length > 0) {
      const dbTagDetails: Array<{ slug: string; title: string }> =
        await this.db('tags')
          .select('slug', 'title')
          .whereIn('slug', tagSlugsArray);

      dbTagDetails.forEach(tagDetail => {
        if (tagDetail.title) {
          tagTitleMap.set(tagDetail.slug, tagDetail.title);
        }
      });
    }

    const results = announcementsWithInitialTags.map(announcement => {
      if (announcement.tags && announcement.tags.length > 0) {
        const updatedTags = announcement.tags.map(tag => ({
          slug: tag.slug,
          title: tagTitleMap.get(tag.slug) || tag.slug,
        }));
        return { ...announcement, tags: updatedTags };
      }
      return announcement;
    });

    const countQueryBuilder = this.db<DbAnnouncement>(announcementsTable).count(
      'id',
      { as: 'total' },
    );
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
          'tags',
        )
        .leftJoin('categories', 'announcements.category', 'categories.slug')
        .where('id', id)
        .first();
    if (!dbAnnouncement) {
      return undefined;
    }

    const announcementBase = DBToAnnouncementWithCategory(dbAnnouncement);

    if (announcementBase.tags && announcementBase.tags.length > 0) {
      const tagSlugs = announcementBase.tags.map(t => t.slug);
      const tagDetailsFromDb: Array<{ slug: string; title: string }> =
        await this.db('tags').select('slug', 'title').whereIn('slug', tagSlugs);

      const tagDetailsMap = new Map(
        tagDetailsFromDb.map(td => [td.slug, td.title]),
      );

      announcementBase.tags = announcementBase.tags.map(tag => ({
        slug: tag.slug,
        title: tagDetailsMap.get(tag.slug) || tag.slug,
      }));
    }

    return announcementBase;
  }

  async deleteAnnouncementByID(id: string): Promise<void> {
    await this.db<DbAnnouncement>(announcementsTable).where('id', id).delete();
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

    const updatedAnnouncement = await this.announcementByID(announcement.id);

    if (!updatedAnnouncement) {
      throw new Error('Failed to retrieve updated announcement');
    }

    return updatedAnnouncement;
  }
}
