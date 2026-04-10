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
import { mockCredentials, mockServices } from '@backstage/backend-test-utils';
import { NotAllowedError } from '@backstage/errors';
import { AuthorizeResult } from '@backstage/plugin-permission-common';
import { DateTime } from 'luxon';
import { createCreateAnnouncementAction } from './createCreateAnnouncementAction';
import { AnnouncementsDatabase } from '../service/persistence/AnnouncementsDatabase';
import { PersistenceContext } from '../service/persistence';

const nowIso = '2025-01-15T10:00:00.000Z';
const now = DateTime.fromISO(nowIso);

const mockInsertedAnnouncement = {
  id: 'ann-new',
  title: 'My New Announcement',
  excerpt: 'An excerpt',
  body: 'Full body',
  publisher: 'user:default/alice',
  active: true,
  created_at: now,
  start_at: now,
  until_date: undefined,
  updated_at: now,
  category: undefined,
  on_behalf_of: undefined,
  sendNotification: false,
};

describe('createCreateAnnouncementAction', () => {
  let mockActionsRegistry: { register: jest.Mock };
  let mockStore: jest.Mocked<AnnouncementsDatabase>;
  let mockPersistenceContext: PersistenceContext;
  let mockPermissions: { authorize: jest.Mock };

  beforeEach(() => {
    mockActionsRegistry = { register: jest.fn() };

    mockStore = {
      insertAnnouncement: jest.fn().mockResolvedValue(mockInsertedAnnouncement),
    } as any;

    mockPersistenceContext = {
      announcementsStore: mockStore,
    } as any;

    mockPermissions = {
      authorize: jest
        .fn()
        .mockResolvedValue([{ result: AuthorizeResult.ALLOW }]),
    };

    createCreateAnnouncementAction({
      actionsRegistry: mockActionsRegistry as any,
      persistenceContext: mockPersistenceContext,
      permissions: mockPermissions as any,
    });
  });

  it('registers the announcements:create-announcement action', () => {
    expect(mockActionsRegistry.register).toHaveBeenCalledTimes(1);
    const reg = mockActionsRegistry.register.mock.calls[0][0];
    expect(reg.name).toBe('announcements:create-announcement');
    expect(reg.attributes.readOnly).toBe(false);
    expect(reg.attributes.destructive).toBe(false);
    expect(reg.attributes.idempotent).toBe(false);
    expect(reg.visibilityPermission).toBeDefined();
    expect(reg.visibilityPermission.name).toBe('announcement.entity.create');
  });

  it('creates an announcement and returns its details', async () => {
    const reg = mockActionsRegistry.register.mock.calls[0][0];
    const credentials = mockCredentials.user();

    const result = await reg.action({
      input: {
        title: 'My New Announcement',
        excerpt: 'An excerpt',
        body: 'Full body',
        publisher: 'user:default/alice',
        active: true,
        start_at: nowIso,
        sendNotification: false,
      },
      credentials,
      logger: mockServices.logger.mock(),
    });

    expect(mockPermissions.authorize).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          permission: expect.objectContaining({
            name: 'announcement.entity.create',
          }),
        }),
      ],
      { credentials },
    );
    expect(mockStore.insertAnnouncement).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'My New Announcement',
        publisher: 'user:default/alice',
      }),
    );
    expect(result.output.id).toBe('ann-new');
    expect(result.output.title).toBe('My New Announcement');
    expect(result.output.created_at).toBe(nowIso);
  });

  it('throws NotAllowedError when permission is denied', async () => {
    mockPermissions.authorize.mockResolvedValue([
      { result: AuthorizeResult.DENY },
    ]);
    const reg = mockActionsRegistry.register.mock.calls[0][0];
    const credentials = mockCredentials.user();

    await expect(
      reg.action({
        input: {
          title: 'Unauthorized',
          excerpt: 'excerpt',
          body: 'body',
          publisher: 'user:default/alice',
          active: true,
          start_at: nowIso,
          sendNotification: false,
        },
        credentials,
        logger: mockServices.logger.mock(),
      }),
    ).rejects.toThrow(NotAllowedError);
  });
});
