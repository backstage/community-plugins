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
  'category' | 'tags' | 'created_at' | 'start_at' | 'until_date' | 'updated_at'
> & {
  category?: string;
  tags?: string[];
  created_at: DateTime;
  start_at: DateTime;
  until_date?: DateTime;
  updated_at: DateTime;
};

/**
 * @internal
 */
type DbAnnouncement = Omit<
  Announcement,
  'category' | 'tags' | 'start_at' | 'until_date' | 'entityRefs'
> & {
  category?: string;
  tags?: string | string[];
  start_at: string;
  until_date: string | null;
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
  if (input instanceof Date) {
    return DateTime.fromJSDate(input).toUTC();
  }
  const trimmed = input.trim();
  const result = trimmed.includes(' ')
    ? DateTime.fromSQL(trimmed, { zone: 'utc' })
    : DateTime.fromISO(trimmed, { zone: 'utc' });
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
    updated_at: announcement.updated_at.toSQL()!,
    active: announcement.active,
    start_at: announcement.start_at.toSQL()!,
    until_date: announcement.until_date
      ? announcement.until_date.toSQL()!
      : null,
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
    until_date: announcementDb.until_date
      ? timestampToDateTime(announcementDb.until_date)
      : null,
    updated_at: timestampToDateTime(announcementDb.updated_at),
    on_behalf_of: announcementDb.on_behalf_of,
    entityRefs: [],
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
      current,
      entityRef,
    } = request;

    const filterBase = <TRecord extends {}, TResult>(
      qb: Knex.QueryBuilder<TRecord, TResult>,
    ) => {
      if (category) {
        qb.where('category', category);
      }
      if (active) {
        qb.where('active', active);
      }
      if (entityRef) {
        // Filter by entity using join table
        qb.innerJoin(
          'announcement_entities',
          'announcements.id',
          'announcement_entities.announcement_id',
        ).where('announcement_entities.entity_ref', entityRef);
      }
      if (current) {
        const today = DateTime.now().toISO();
        qb.where('start_at', '<=', today).andWhere(q =>
          q.whereNull('until_date').orWhere('until_date', '>=', today),
        );
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
        'until_date',
        'on_behalf_of',
        'tags',
        'updated_at',
      )
      .orderBy(sortBy, order)
      .leftJoin('categories', 'announcements.category', 'categories.slug');
    filterBase(queryBuilder);
    filterRange(queryBuilder);

    const announcementRows = await queryBuilder;

    const announcementsWithInitialTags = announcementRows.map(row =>
      DBToAnnouncementWithCategory(row),
    );

    // Fetch entity references for all announcements
    const announcementIds = announcementsWithInitialTags.map(a => a.id);
    const entityRefs: Array<{ announcement_id: string; entity_ref: string }> =
      announcementIds.length > 0
        ? await this.db('announcement_entities')
            .select('announcement_id', 'entity_ref')
            .whereIn('announcement_id', announcementIds)
        : [];

    // Build a map of announcement_id -> entityRefs[]
    const entityRefMap = new Map<string, string[]>();
    entityRefs.forEach(row => {
      if (!entityRefMap.has(row.announcement_id)) {
        entityRefMap.set(row.announcement_id, []);
      }
      entityRefMap.get(row.announcement_id)!.push(row.entity_ref);
    });

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
        return {
          ...announcement,
          tags: updatedTags,
          entityRefs: entityRefMap.get(announcement.id) || [],
        };
      }
      return {
        ...announcement,
        entityRefs: entityRefMap.get(announcement.id) || [],
      };
    });

    const countQueryBuilder = this.db<DbAnnouncement>(announcementsTable).count(
      'id',
      { as: 'total' },
    );
    filterBase(countQueryBuilder);
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
          'until_date',
          'on_behalf_of',
          'tags',
          'updated_at',
        )
        .leftJoin('categories', 'announcements.category', 'categories.slug')
        .where('id', id)
        .first();
    if (!dbAnnouncement) {
      return undefined;
    }

    const announcementBase = DBToAnnouncementWithCategory(dbAnnouncement);

    // Fetch entity references from join table
    const entityRefs: Array<{ entity_ref: string }> = await this.db(
      'announcement_entities',
    )
      .select('entity_ref')
      .where('announcement_id', id);

    announcementBase.entityRefs = entityRefs.map(row => row.entity_ref);

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

    // Insert entity relationships if present
    if (announcement.entityRefs && announcement.entityRefs.length > 0) {
      await this.db('announcement_entities').insert(
        announcement.entityRefs.map(entity_ref => ({
          announcement_id: announcement.id,
          entity_ref,
        })),
      );
    }

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

    // Update entity relationships: delete all existing and insert new ones
    await this.db('announcement_entities')
      .where('announcement_id', announcement.id)
      .delete();

    if (announcement.entityRefs && announcement.entityRefs.length > 0) {
      await this.db('announcement_entities').insert(
        announcement.entityRefs.map(entity_ref => ({
          announcement_id: announcement.id,
          entity_ref,
        })),
      );
    }

    const updatedAnnouncement = await this.announcementByID(announcement.id);

    if (!updatedAnnouncement) {
      throw new Error('Failed to retrieve updated announcement');
    }

    return updatedAnnouncement;
  }
}
