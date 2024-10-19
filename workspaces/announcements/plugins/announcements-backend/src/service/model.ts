import { Announcement } from '@backstage/community-plugins/backstage-plugin-announcements-common';
import { DateTime } from 'luxon';

export type AnnouncementModel = Omit<Announcement, 'created_at'> & {
  created_at: DateTime;
};
