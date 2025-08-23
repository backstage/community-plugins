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
import express from 'express';
import { DateTime } from 'luxon';
import request from 'supertest';
import { AnnouncementsContext } from './service/announcementsContextBuilder';
import { AnnouncementsDatabase } from './service/persistence/AnnouncementsDatabase';
import { PersistenceContext } from './service/persistence/persistenceContext';
import { createRouter } from './router';
import { CategoriesDatabase } from './service/persistence/CategoriesDatabase';
import {
  HttpAuthService,
  PermissionsService,
} from '@backstage/backend-plugin-api';
import { mockServices } from '@backstage/backend-test-utils';
import { TagsDatabase } from './service/persistence/TagsDatabase.ts';

describe('createRouter', () => {
  let app: express.Express;

  const announcementsMock = jest.fn();
  const announcementByIDMock = jest.fn();
  const deleteAnnouncementByIDMock = jest.fn();
  const insertAnnouncementMock = jest.fn();
  const updateAnnouncementMock = jest.fn();

  const mockPersistenceContext: PersistenceContext = {
    announcementsStore: {
      announcements: announcementsMock,
      announcementByID: announcementByIDMock,
      deleteAnnouncementByID: deleteAnnouncementByIDMock,
      insertAnnouncement: insertAnnouncementMock,
      updateAnnouncement: updateAnnouncementMock,
    } as unknown as AnnouncementsDatabase,
    categoriesStore: {} as unknown as CategoriesDatabase,
    tagsStore: {} as unknown as TagsDatabase,
  };

  const mockPermissions: PermissionsService = {
    authorize: jest.fn(),
    authorizeConditional: jest.fn(),
  };

  const mockHttpAuth: HttpAuthService = {
    credentials: jest.fn(),
    issueUserCookie: jest.fn(),
  };

  afterEach(() => {
    jest.resetAllMocks();
  });

  beforeAll(async () => {
    const announcementsContext: AnnouncementsContext = {
      logger: mockServices.logger.mock(),
      config: mockServices.rootConfig.mock(),
      persistenceContext: mockPersistenceContext,
      permissions: mockPermissions,
      permissionsRegistry: mockServices.permissionsRegistry.mock(),
      httpAuth: mockHttpAuth,
    };

    const router = await createRouter(announcementsContext);
    app = express().use(router);
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('GET /announcements', () => {
    it('returns ok', async () => {
      announcementsMock.mockReturnValueOnce([
        {
          id: 'uuid',
          title: 'title',
          excerpt: 'excerpt',
          body: 'body',
          publisher: 'user:default/name',
          created_at: DateTime.fromISO('2022-11-02T15:28:08.539Z'),
          start_at: DateTime.fromISO('2022-11-02T15:28:08.539Z'),
        },
      ]);

      const response = await request(app).get('/announcements');

      expect(response.status).toEqual(200);
      expect(announcementsMock).toHaveBeenCalledWith({
        category: undefined,
        max: undefined,
        offset: undefined,
        active: undefined,
        sortBy: 'created_at', // Default sortBy
        order: 'desc', // Default order
      });

      expect(response.body).toEqual([
        {
          id: 'uuid',
          title: 'title',
          excerpt: 'excerpt',
          body: 'body',
          publisher: 'user:default/name',
          created_at: '2022-11-02T15:28:08.539+00:00',
          start_at: '2022-11-02T15:28:08.539+00:00',
        },
      ]);
    });
    it('supports sortby and order parameters', async () => {
      announcementsMock.mockReturnValueOnce([
        {
          id: 'uuid1',
          title: 'title1',
          excerpt: 'excerpt1',
          body: 'body1',
          publisher: 'user:default/name',
          created_at: DateTime.fromISO('2025-01-01T15:28:08.539Z'),
          start_at: DateTime.fromISO('2025-01-01T15:28:08.539Z'),
        },
        {
          id: 'uuid2',
          title: 'title2',
          excerpt: 'excerpt2',
          body: 'body2',
          publisher: 'user:default/name',
          created_at: DateTime.fromISO('2025-01-02T15:28:08.539Z'),
          start_at: DateTime.fromISO('2025-01-02T15:28:08.539Z'),
        },
      ]);

      const response = await request(app).get(
        '/announcements?sortby=createdAt&order=asc',
      );

      expect(response.status).toEqual(200);
      expect(announcementsMock).toHaveBeenCalledWith({
        category: undefined,
        max: undefined,
        offset: undefined,
        active: undefined,
        sortBy: 'created_at',
        order: 'asc',
      });

      expect(response.body).toEqual([
        {
          id: 'uuid1',
          title: 'title1',
          excerpt: 'excerpt1',
          body: 'body1',
          publisher: 'user:default/name',
          created_at: '2025-01-01T15:28:08.539+00:00',
          start_at: '2025-01-01T15:28:08.539+00:00',
        },
        {
          id: 'uuid2',
          title: 'title2',
          excerpt: 'excerpt2',
          body: 'body2',
          publisher: 'user:default/name',
          created_at: '2025-01-02T15:28:08.539+00:00',
          start_at: '2025-01-02T15:28:08.539+00:00',
        },
      ]);
    });
    it('filters announcements by single tag', async () => {
      announcementsMock.mockReturnValueOnce({
        results: [
          {
            id: 'uuid1',
            title: 'Tagged Announcement',
            excerpt: 'This has tag1',
            body: 'Full content',
            publisher: 'user:default/name',
            created_at: DateTime.fromISO('2023-01-01T10:00:00.000Z'),
            start_at: DateTime.fromISO('2023-01-01T10:00:00.000Z'),
            tags: [{ slug: 'tag1', title: 'Tag 1' }],
          },
        ],
        count: 1,
      });

      const response = await request(app).get('/announcements?tags=tag1');

      expect(response.status).toEqual(200);
      expect(announcementsMock).toHaveBeenCalledWith({
        category: undefined,
        max: undefined,
        offset: undefined,
        active: undefined,
        sortBy: 'created_at',
        order: 'desc',
        tags: ['tag1'],
      });

      expect(response.body.results).toHaveLength(1);
      expect(response.body.results[0].tags).toEqual([
        { slug: 'tag1', title: 'Tag 1' },
      ]);
    });

    it('filters announcements by multiple tags', async () => {
      announcementsMock.mockReturnValueOnce({
        results: [
          {
            id: 'uuid1',
            title: 'Multi-tagged Announcement',
            excerpt: 'This has multiple tags',
            body: 'Full content',
            publisher: 'user:default/name',
            created_at: DateTime.fromISO('2023-01-01T10:00:00.000Z'),
            start_at: DateTime.fromISO('2023-01-01T10:00:00.000Z'),
            tags: [
              { slug: 'tag1', title: 'Tag 1' },
              { slug: 'tag2', title: 'Tag 2' },
            ],
          },
        ],
        count: 1,
      });

      const response = await request(app).get('/announcements?tags=tag1,tag2');

      expect(response.status).toEqual(200);
      expect(announcementsMock).toHaveBeenCalledWith({
        category: undefined,
        max: undefined,
        offset: undefined,
        active: undefined,
        sortBy: 'created_at',
        order: 'desc',
        tags: ['tag1', 'tag2'],
      });

      expect(response.body.results).toHaveLength(1);
      expect(response.body.results[0].tags).toEqual([
        { slug: 'tag1', title: 'Tag 1' },
        { slug: 'tag2', title: 'Tag 2' },
      ]);
    });

    it('returns empty results when no announcements match tags', async () => {
      announcementsMock.mockReturnValueOnce({
        results: [],
        count: 0,
      });

      const response = await request(app).get(
        '/announcements?tags=nonexistent',
      );

      expect(response.status).toEqual(200);
      expect(announcementsMock).toHaveBeenCalledWith({
        category: undefined,
        max: undefined,
        offset: undefined,
        active: undefined,
        sortBy: 'created_at',
        order: 'desc',
        tags: ['nonexistent'],
      });

      expect(response.body.results).toHaveLength(0);
      expect(response.body.count).toEqual(0);
    });
  });
});
