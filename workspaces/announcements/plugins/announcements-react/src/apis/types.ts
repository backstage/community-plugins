import { Announcement } from '@backstage-community/plugin-announcements-common';

export type CreateAnnouncementRequest = Omit<
  Announcement,
  'id' | 'category' | 'created_at'
> & {
  category?: string;
};

export type CreateCategoryRequest = {
  title: string;
};
