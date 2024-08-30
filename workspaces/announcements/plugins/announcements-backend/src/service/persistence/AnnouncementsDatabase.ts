import { Knex } from 'knex';
import { DateTime } from 'luxon';
import { AnnouncementModel } from '../model';
import {
  AnnouncementsFilters,
  Announcement,
} from '@backstage-community/plugin-announcements-common';
import slugify from 'slugify';

const announcementsTable = 'announcements';

type AnnouncementUpsert = Omit<Announcement, 'category' | 'created_at'> & {
  category?: string;
  created_at: DateTime;
};

export type DbAnnouncement = Omit<Announcement, 'category'> & {
  category?: string;
};

export type DbAnnouncementWithCategory = DbAnnouncement & {
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
  };
};

export class AnnouncementsDatabase {
  constructor(private readonly db: Knex) {}

  async announcements(
    request: AnnouncementsFilters,
  ): Promise<AnnouncementModelsList> {
    const countQueryBuilder = this.db<DbAnnouncement>(announcementsTable).count<
      Record<string, number>
    >('id', { as: 'total' });

    if (request.category) {
      countQueryBuilder.where('category', request.category);
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
      )
      .orderBy('created_at', 'desc')
      .leftJoin('categories', 'announcements.category', 'categories.slug');

    if (request.category) {
      queryBuilder.where('category', request.category);
    }
    if (request.offset) {
      queryBuilder.offset(request.offset);
    }
    if (request.max) {
      queryBuilder.limit(request.max);
    }

    return {
      count:
        countResult && countResult.total
          ? parseInt(countResult.total.toString(), 10)
          : 0,
      results: (await queryBuilder.select()).map(DBToAnnouncementWithCategory),
    };
  }

  async announcementByID(id: string): Promise<AnnouncementModel | undefined> {
    const dbAnnouncement = await this.db<DbAnnouncementWithCategory>(
      announcementsTable,
    )
      .select(
        'id',
        'publisher',
        'announcements.title',
        'excerpt',
        'body',
        'category',
        'created_at',
        'categories.title as category_title',
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

    return (await this.announcementByID(announcement.id))!;
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
