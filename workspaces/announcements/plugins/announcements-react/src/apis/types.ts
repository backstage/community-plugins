import { Announcement } from '@procore-oss/backstage-plugin-announcements-common';

export type CreateAnnouncementRequest = Omit<
  Announcement,
  'id' | 'category' | 'created_at'
> & {
  category?: string;
};

export type CreateCategoryRequest = {
  title: string;
};
