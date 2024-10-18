import { DateTime } from 'luxon';
import { createApiRef } from '@backstage/core-plugin-api';
import { CreateAnnouncementRequest, CreateCategoryRequest } from './types';
import {
  Announcement,
  AnnouncementsList,
  Category,
} from '@backstage-community/plugin-announcements-common';

export const announcementsApiRef = createApiRef<AnnouncementsApi>({
  id: 'plugin.announcements.service',
});

export interface AnnouncementsApi {
  announcements(opts: {
    max?: number;
    page?: number;
    category?: string;
  }): Promise<AnnouncementsList>;
  announcementByID(id: string): Promise<Announcement>;

  createAnnouncement(request: CreateAnnouncementRequest): Promise<Announcement>;
  updateAnnouncement(
    id: string,
    request: CreateAnnouncementRequest,
  ): Promise<Announcement>;
  deleteAnnouncementByID(id: string): Promise<void>;

  categories(): Promise<Category[]>;
  createCategory(request: CreateCategoryRequest): Promise<void>;
  deleteCategory(slug: string): Promise<void>;

  lastSeenDate(): DateTime;
  markLastSeenDate(date: DateTime): void;
}
