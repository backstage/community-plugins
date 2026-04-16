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
import { NotAllowedError, NotFoundError } from '@backstage/errors';
import { AuthorizeResult } from '@backstage/plugin-permission-common';
import { DateTime } from 'luxon';
import { createDeleteAnnouncementAction } from './createDeleteAnnouncementAction';
import { AnnouncementsDatabase } from '../service/persistence/AnnouncementsDatabase';
import { PersistenceContext } from '../service/persistence';

const nowIso = '2025-01-15T10:00:00.000Z';
const now = DateTime.fromISO(nowIso);

const mockAnnouncementModel = {
  id: 'ann-1',
  title: 'Test Announcement',
  excerpt: 'Short summary',
  body: 'Full body text',
  publisher: 'user:default/alice',
  active: true,
  created_at: now,
  start_at: now,
  until_date: undefined,
  updated_at: now,
  sendNotification: false,
};

describe('createDeleteAnnouncementAction', () => {
  let mockActionsRegistry: { register: jest.Mock };
  let mockStore: jest.Mocked<AnnouncementsDatabase>;
  let mockPersistenceContext: PersistenceContext;
  let mockPermissions: { authorize: jest.Mock };

  beforeEach(() => {
    mockActionsRegistry = { register: jest.fn() };

    mockStore = {
      announcementByID: jest.fn().mockResolvedValue(mockAnnouncementModel),
      deleteAnnouncementByID: jest.fn().mockResolvedValue(undefined),
    } as any;

    mockPersistenceContext = {
      announcementsStore: mockStore,
    } as any;

    mockPermissions = {
      authorize: jest
        .fn()
        .mockResolvedValue([{ result: AuthorizeResult.ALLOW }]),
    };

    createDeleteAnnouncementAction({
      actionsRegistry: mockActionsRegistry as any,
      persistenceContext: mockPersistenceContext,
      permissions: mockPermissions as any,
    });
  });

  it('registers the announcements:delete-announcement action', () => {
    expect(mockActionsRegistry.register).toHaveBeenCalledTimes(1);
    const reg = mockActionsRegistry.register.mock.calls[0][0];
    expect(reg.name).toBe('announcements:delete-announcement');
    expect(reg.attributes.readOnly).toBe(false);
    expect(reg.attributes.destructive).toBe(true);
    expect(reg.attributes.idempotent).toBe(true);
    expect(reg.visibilityPermission).toBeDefined();
    expect(reg.visibilityPermission.name).toBe('announcement.entity.delete');
  });

  it('deletes an announcement and returns success', async () => {
    const reg = mockActionsRegistry.register.mock.calls[0][0];
    const credentials = mockCredentials.user();

    const result = await reg.action({
      input: { id: 'ann-1' },
      credentials,
      logger: mockServices.logger.mock(),
    });

    expect(mockPermissions.authorize).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          permission: expect.objectContaining({
            name: 'announcement.entity.delete',
          }),
        }),
      ],
      { credentials },
    );
    expect(mockStore.announcementByID).toHaveBeenCalledWith('ann-1');
    expect(mockStore.deleteAnnouncementByID).toHaveBeenCalledWith('ann-1');
    expect(result.output.success).toBe(true);
  });

  it('throws NotAllowedError when permission is denied', async () => {
    mockPermissions.authorize.mockResolvedValue([
      { result: AuthorizeResult.DENY },
    ]);
    const reg = mockActionsRegistry.register.mock.calls[0][0];
    const credentials = mockCredentials.user();

    await expect(
      reg.action({
        input: { id: 'ann-1' },
        credentials,
        logger: mockServices.logger.mock(),
      }),
    ).rejects.toThrow(NotAllowedError);
  });

  it('throws NotFoundError when announcement does not exist', async () => {
    mockStore.announcementByID.mockResolvedValue(undefined);
    const reg = mockActionsRegistry.register.mock.calls[0][0];
    const credentials = mockCredentials.user();

    await expect(
      reg.action({
        input: { id: 'non-existent' },
        credentials,
        logger: mockServices.logger.mock(),
      }),
    ).rejects.toThrow(NotFoundError);

    expect(mockStore.deleteAnnouncementByID).not.toHaveBeenCalled();
  });
});
