import { SignalsService } from '@backstage/plugin-signals-node';
import { AnnouncementModel } from './model';
import {
  AnnouncementSignal,
  SIGNALS_CHANNEL_ANNOUNCEMENTS,
} from '@backstage/community-plugins/backstage-plugin-announcements-common';

export const signalAnnouncement = async (
  announcement: AnnouncementModel,
  signals?: SignalsService,
) => {
  if (!signals) {
    return;
  }

  await signals.publish<AnnouncementSignal>({
    recipients: { type: 'broadcast' },
    channel: SIGNALS_CHANNEL_ANNOUNCEMENTS,
    message: {
      data: {
        ...announcement,
        created_at: announcement.created_at.toString(),
      },
    },
  });
};
