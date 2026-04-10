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
import { DateTime } from 'luxon';
import { createListAnnouncementsAction } from './createListAnnouncementsAction';
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
  category: undefined,
  on_behalf_of: undefined,
  tags: undefined,
  sendNotification: false,
};

describe('createListAnnouncementsAction', () => {
  let mockActionsRegistry: { register: jest.Mock };
  let mockStore: jest.Mocked<AnnouncementsDatabase>;
  let mockPersistenceContext: PersistenceContext;

  beforeEach(() => {
    mockActionsRegistry = { register: jest.fn() };

    mockStore = {
      announcements: jest.fn().mockResolvedValue({
        count: 1,
        results: [mockAnnouncementModel],
      }),
    } as any;

    mockPersistenceContext = {
      announcementsStore: mockStore,
    } as any;

    createListAnnouncementsAction({
      actionsRegistry: mockActionsRegistry as any,
      persistenceContext: mockPersistenceContext,
    });
  });

  it('registers the announcements:list-announcements action', () => {
    expect(mockActionsRegistry.register).toHaveBeenCalledTimes(1);
    const reg = mockActionsRegistry.register.mock.calls[0][0];
    expect(reg.name).toBe('announcements:list-announcements');
    expect(reg.attributes.readOnly).toBe(true);
    expect(reg.attributes.destructive).toBe(false);
    expect(reg.attributes.idempotent).toBe(true);
  });

  it('returns announcements with serialized ISO dates', async () => {
    const reg = mockActionsRegistry.register.mock.calls[0][0];
    const credentials = mockCredentials.user();

    const result = await reg.action({
      input: {},
      credentials,
      logger: mockServices.logger.mock(),
    });

    expect(mockStore.announcements).toHaveBeenCalledWith({
      max: undefined,
      offset: undefined,
      category: undefined,
      tags: undefined,
      active: undefined,
      sortBy: 'created_at',
      order: 'desc',
    });

    expect(result.output.count).toBe(1);
    expect(result.output.announcements).toHaveLength(1);
    const ann = result.output.announcements[0];
    expect(ann.id).toBe('ann-1');
    expect(ann.title).toBe('Test Announcement');
    expect(ann.created_at).toBe(nowIso);
  });

  it('passes filters to the store', async () => {
    const reg = mockActionsRegistry.register.mock.calls[0][0];
    const credentials = mockCredentials.user();

    await reg.action({
      input: {
        max: 5,
        page: 2,
        category: 'general',
        active: true,
        sortBy: 'start_at',
        order: 'asc',
      },
      credentials,
      logger: mockServices.logger.mock(),
    });

    expect(mockStore.announcements).toHaveBeenCalledWith({
      max: 5,
      offset: 5,
      category: 'general',
      tags: undefined,
      active: true,
      sortBy: 'start_at',
      order: 'asc',
    });
  });

  it('returns empty list when store returns no results', async () => {
    mockStore.announcements.mockResolvedValue({ count: 0, results: [] });
    const reg = mockActionsRegistry.register.mock.calls[0][0];
    const credentials = mockCredentials.user();

    const result = await reg.action({
      input: {},
      credentials,
      logger: mockServices.logger.mock(),
    });

    expect(result.output.count).toBe(0);
    expect(result.output.announcements).toEqual([]);
  });
});
