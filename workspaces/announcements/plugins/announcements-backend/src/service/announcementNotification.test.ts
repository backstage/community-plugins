/*
 * Copyright 2025 The Backstage Authors
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
import { mockServices } from '@backstage/backend-test-utils';
import { DateTime } from 'luxon';
import { sendAnnouncementNotification } from './announcementNotification';
import { AnnouncementModel } from './model';

const mockAnnouncement: AnnouncementModel = {
  id: 'test-id',
  title: 'Test Announcement',
  excerpt: 'Test excerpt',
  body: 'Test body',
  publisher: 'user:default/test',
  active: true,
  created_at: DateTime.fromISO('2024-01-01T00:00:00.000Z'),
  start_at: DateTime.fromISO('2024-01-01T00:00:00.000Z'),
  updated_at: DateTime.fromISO('2024-01-01T00:00:00.000Z'),
};

describe('sendAnnouncementNotification', () => {
  const mockNotifications = {
    send: jest.fn().mockResolvedValue(undefined),
  };

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('does nothing when notifications service is not provided', async () => {
    await sendAnnouncementNotification(mockAnnouncement);

    expect(mockNotifications.send).not.toHaveBeenCalled();
  });

  it('sends notification with absolute URL when config provides app.baseUrl', async () => {
    const config = mockServices.rootConfig({
      data: { app: { baseUrl: 'https://backstage.example.com' } },
    });

    await sendAnnouncementNotification(
      mockAnnouncement,
      mockNotifications,
      config,
    );

    expect(mockNotifications.send).toHaveBeenCalledWith({
      recipients: { type: 'broadcast' },
      payload: {
        title: `New Announcement "${mockAnnouncement.title}"`,
        description: mockAnnouncement.excerpt,
        link: `https://backstage.example.com/announcements/view/${mockAnnouncement.id}`,
      },
    });
  });

  it('sends notification with relative URL when config is not provided', async () => {
    await sendAnnouncementNotification(mockAnnouncement, mockNotifications);

    expect(mockNotifications.send).toHaveBeenCalledWith({
      recipients: { type: 'broadcast' },
      payload: {
        title: `New Announcement "${mockAnnouncement.title}"`,
        description: mockAnnouncement.excerpt,
        link: `/announcements/view/${mockAnnouncement.id}`,
      },
    });
  });

  it('sends notification with relative URL when app.baseUrl is not set in config', async () => {
    const config = mockServices.rootConfig({ data: {} });

    await sendAnnouncementNotification(
      mockAnnouncement,
      mockNotifications,
      config,
    );

    expect(mockNotifications.send).toHaveBeenCalledWith({
      recipients: { type: 'broadcast' },
      payload: {
        title: `New Announcement "${mockAnnouncement.title}"`,
        description: mockAnnouncement.excerpt,
        link: `/announcements/view/${mockAnnouncement.id}`,
      },
    });
  });
});
