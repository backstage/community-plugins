import { Knex } from 'knex';
import { DateTime } from 'luxon';
import { AnnouncementModel } from '../model';
import {
  AnnouncementsFilters,
  Announcement,
} from '@backstage/community-plugins/backstage-plugin-announcements-common';
import slugify from 'slugify';

const announcementsTable = 'announcements';

type AnnouncementUpsert = Omit<Announcement, 'category' | 'created_at'> & {
  category?: string;
  created_at: DateTime;
};

type DbAnnouncement = Omit<Announcement, 'category'> & {
  category?: string;
};

type DbAnnouncementWithCategory = DbAnnouncement & {
  category_slug?: string;
  category_title?: string;
};

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
  };
};

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
  };
};

export class AnnouncementsDatabase {
  constructor(private readonly db: Knex) {}

  async announcements(
    request: AnnouncementsFilters,
  ): Promise<AnnouncementModelsList> {
    const { category, offset, max, active } = request;

    const countQueryBuilder = this.db<DbAnnouncement>(announcementsTable).count<
      Record<string, number>
    >('id', { as: 'total' });

    if (category) {
      countQueryBuilder.where('category', category);
    }

    const countResult = await countQueryBuilder.first();
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
      )
      .orderBy('created_at', 'desc')
      .leftJoin('categories', 'announcements.category', 'categories.slug');

    if (category) {
      queryBuilder.where('category', category);
    }
    if (offset) {
      queryBuilder.offset(offset);
    }
    if (max) {
      queryBuilder.limit(max);
    }
    if (active) {
      queryBuilder.where('active', active);
    }

    const results = (await queryBuilder.select()).map(
      DBToAnnouncementWithCategory,
    );

    let count =
      countResult && countResult.total
        ? parseInt(countResult.total.toString(), 10)
        : 0;

    /*
     * If we have a filter, we need to calculate the count
     * based on the results we have, as the count query will not
     * take into account the filter (i.e., limit and offset).
     */
    if (max || offset || active) {
      count = results.length;
    }

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
