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
import { SignalsService } from '@backstage/plugin-signals-node';
import { AnnouncementModel } from './model';
import {
  AnnouncementSignal,
  SIGNALS_CHANNEL_ANNOUNCEMENTS,
} from '@backstage-community/plugin-announcements-common';

/**
 * Forwards an announcement to the signals service.
 *
 * @param announcement the announcement to signal
 * @param signals an optional signals service to use, if not provided, the announcement will not be signaled
 * @returns a promise that resolves when the announcement has been signaled
 *
 * @public
 * @remarks
 *
 * Signal types are located in `@backstage-community/plugin-announcements-common`.
 */
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
        start_at: announcement.start_at.toString(),
        until_date: announcement.until_date
          ? announcement.until_date.toString()
          : null,
        updated_at: announcement.updated_at.toString(),
      },
    },
  });
};
