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
import { InputError, NotAllowedError, NotFoundError } from '@backstage/errors';
import { EventsService } from '@backstage/plugin-events-node';
import { AuthorizeResult } from '@backstage/plugin-permission-common';
import { SignalsService } from '@backstage/plugin-signals-node';
import { TagsDatabase } from './service/persistence/TagsDatabase.ts';
import {
  announcementEntityPermissions,
  AUDITOR_ACTION_CREATE,
  AUDITOR_ACTION_DELETE,
  AUDITOR_ACTION_UPDATE,
  AUDITOR_FETCH_EVENT_ID,
  AUDITOR_MUTATE_EVENT_ID,
  EVENTS_ACTION_CREATE_ANNOUNCEMENT,
  EVENTS_ACTION_CREATE_CATEGORY,
  EVENTS_ACTION_DELETE_ANNOUNCEMENT,
  EVENTS_ACTION_DELETE_CATEGORY,
  EVENTS_ACTION_UPDATE_ANNOUNCEMENT,
  EVENTS_TOPIC_ANNOUNCEMENTS,
  MAX_TITLE_TAG_LENGTH,
  SIGNALS_CHANNEL_ANNOUNCEMENTS,
} from '@backstage-community/plugin-announcements-common';

describe('createRouter', () => {
  let app: express.Express;
  let auditorMock!: ReturnType<typeof mockServices.auditor.mock>;
  let lastAuditorEvent: { success: jest.Mock; fail: jest.Mock } | undefined;

  const announcementsMock = jest.fn();
  const announcementByIDMock = jest.fn();
  const deleteAnnouncementByIDMock = jest.fn();
  const insertAnnouncementMock = jest.fn();
  const updateAnnouncementMock = jest.fn();
  const categoriesMock = jest.fn();
  const insertCategoryMock = jest.fn();
  const deleteCategoryMock = jest.fn();
  const tagsMock = jest.fn();
  const tagBySlugMock = jest.fn();
  const insertTagMock = jest.fn();
  const deleteTagMock = jest.fn();

  const mockPersistenceContext: PersistenceContext = {
    announcementsStore: {
      announcements: announcementsMock,
      announcementByID: announcementByIDMock,
      deleteAnnouncementByID: deleteAnnouncementByIDMock,
      insertAnnouncement: insertAnnouncementMock,
      updateAnnouncement: updateAnnouncementMock,
    } as unknown as AnnouncementsDatabase,
    categoriesStore: {
      categories: categoriesMock,
      insert: insertCategoryMock,
      delete: deleteCategoryMock,
    } as unknown as CategoriesDatabase,
    tagsStore: {
      tags: tagsMock,
      tagBySlug: tagBySlugMock,
      insert: insertTagMock,
      delete: deleteTagMock,
    } as unknown as TagsDatabase,
  };

  const mockEvents: EventsService = {
    publish: jest.fn(),
    subscribe: jest.fn(),
  };

  const mockSignals: SignalsService = {
    publish: jest.fn(),
  };

  const mockCredentials = {
    principal: { type: 'user', userEntityRef: 'user:default/name' },
  };

  const announcement = {
    id: 'uuid',
    title: 'title',
    excerpt: 'excerpt',
    body: 'body',
    publisher: 'user:default/name',
    active: true,
    created_at: DateTime.fromISO('2025-01-01T00:00:00.000Z'),
    start_at: DateTime.fromISO('2025-01-01T00:00:00.000Z'),
    until_date: DateTime.fromISO('2025-02-01T00:00:00.000Z'),
    updated_at: DateTime.fromISO('2025-01-01T00:00:00.000Z'),
    tags: [],
  };

  const mockPermissions: PermissionsService = {
    authorize: jest.fn(),
    authorizeConditional: jest.fn(),
  };

  const mockHttpAuth: HttpAuthService = {
    credentials: jest.fn(),
    issueUserCookie: jest.fn(),
  };

  const mockNotificationService = {
    send: jest.fn().mockImplementation(async () => {}),
  };

  afterEach(() => {
    jest.resetAllMocks();
  });

  beforeAll(async () => {
    auditorMock = mockServices.auditor.mock();
    lastAuditorEvent = undefined;
    auditorMock.createEvent.mockImplementation(async () => {
      lastAuditorEvent = {
        success: jest.fn().mockResolvedValue(undefined),
        fail: jest.fn().mockResolvedValue(undefined),
      };
      return lastAuditorEvent;
    });

    const announcementsContext: AnnouncementsContext = {
      logger: mockServices.logger.mock(),
      config: mockServices.rootConfig.mock(),
      persistenceContext: mockPersistenceContext,
      permissions: mockPermissions,
      permissionsRegistry: mockServices.permissionsRegistry.mock(),
      httpAuth: mockHttpAuth,
      notifications: mockNotificationService,
      auditor: auditorMock,
      events: mockEvents,
      signals: mockSignals,
    };

    const router = await createRouter(announcementsContext);
    app = express().use(router);
    mockNotificationService.send.mockClear();
    auditorMock.createEvent.mockClear();
  });

  beforeEach(() => {
    lastAuditorEvent = undefined;
    mockNotificationService.send.mockImplementation(async () => {});
    auditorMock.createEvent.mockImplementation(async () => {
      lastAuditorEvent = {
        success: jest.fn().mockResolvedValue(undefined),
        fail: jest.fn().mockResolvedValue(undefined),
      };
      return lastAuditorEvent;
    });
    (mockHttpAuth.credentials as jest.Mock).mockResolvedValue(mockCredentials);
    (mockPermissions.authorize as jest.Mock).mockResolvedValue([
      { result: AuthorizeResult.ALLOW },
    ]);
  });

  const expectAuditorSuccess = () => {
    expect(auditorMock.createEvent).toHaveBeenCalled();
    expect(lastAuditorEvent).toBeDefined();
    if (!lastAuditorEvent) {
      return;
    }
    expect(lastAuditorEvent.success).toHaveBeenCalled();
    expect(lastAuditorEvent.fail).not.toHaveBeenCalled();
  };

  const expectAuditorFailure = (error: unknown = expect.anything()) => {
    expect(auditorMock.createEvent).toHaveBeenCalled();
    expect(lastAuditorEvent).toBeDefined();
    if (!lastAuditorEvent) {
      return;
    }
    expect(lastAuditorEvent.fail).toHaveBeenCalledWith({ error });
    expect(lastAuditorEvent.success).not.toHaveBeenCalled();
  };

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
          until_date: DateTime.fromISO('2022-12-02T15:28:08.539Z'),
          updated_at: DateTime.fromISO('2022-11-02T15:28:08.539Z'),
        },
      ]);

      const response = await request(app).get('/announcements');

      expect(response.status).toEqual(200);
      expect(announcementsMock).toHaveBeenCalledWith({
        category: undefined,
        max: undefined,
        offset: undefined,
        active: false,
        sortBy: 'created_at', // Default sortBy
        order: 'desc', // Default order
        current: undefined,
      });

      expect(auditorMock.createEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventId: AUDITOR_FETCH_EVENT_ID,
          severityLevel: 'low',
          meta: expect.objectContaining({ queryType: 'all' }),
        }),
      );
      expectAuditorSuccess();

      expect(response.body).toEqual([
        {
          id: 'uuid',
          title: 'title',
          excerpt: 'excerpt',
          body: 'body',
          publisher: 'user:default/name',
          created_at: '2022-11-02T15:28:08.539+00:00',
          start_at: '2022-11-02T15:28:08.539+00:00',
          until_date: '2022-12-02T15:28:08.539+00:00',
          updated_at: '2022-11-02T15:28:08.539+00:00',
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
          until_date: DateTime.fromISO('2025-02-01T15:28:08.539Z'),
          updated_at: DateTime.fromISO('2025-01-01T15:28:08.539Z'),
        },
        {
          id: 'uuid2',
          title: 'title2',
          excerpt: 'excerpt2',
          body: 'body2',
          publisher: 'user:default/name',
          created_at: DateTime.fromISO('2025-01-02T15:28:08.539Z'),
          start_at: DateTime.fromISO('2025-01-02T15:28:08.539Z'),
          until_date: DateTime.fromISO('2025-02-02T15:28:08.539Z'),
          updated_at: DateTime.fromISO('2025-01-02T15:28:08.539Z'),
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
        active: false,
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
          until_date: '2025-02-01T15:28:08.539+00:00',
          updated_at: '2025-01-01T15:28:08.539+00:00',
        },
        {
          id: 'uuid2',
          title: 'title2',
          excerpt: 'excerpt2',
          body: 'body2',
          publisher: 'user:default/name',
          created_at: '2025-01-02T15:28:08.539+00:00',
          start_at: '2025-01-02T15:28:08.539+00:00',
          until_date: '2025-02-02T15:28:08.539+00:00',
          updated_at: '2025-01-02T15:28:08.539+00:00',
        },
      ]);
      expectAuditorSuccess();
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
            until_date: DateTime.fromISO('2023-01-01T10:00:00.000Z'),
            updated_at: DateTime.fromISO('2023-01-01T10:00:00.000Z'),
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
        active: false,
        sortBy: 'created_at',
        order: 'desc',
        current: undefined,
        tags: ['tag1'],
      });

      expect(response.body.results).toHaveLength(1);
      expect(response.body.results[0].tags).toEqual([
        { slug: 'tag1', title: 'Tag 1' },
      ]);
      expectAuditorSuccess();
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
            until_date: DateTime.fromISO('2023-01-01T10:00:00.000Z'),
            updated_at: DateTime.fromISO('2023-01-01T10:00:00.000Z'),
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
        active: false,
        sortBy: 'created_at',
        order: 'desc',
        current: undefined,
        tags: ['tag1', 'tag2'],
      });

      expect(response.body.results).toHaveLength(1);
      expect(response.body.results[0].tags).toEqual([
        { slug: 'tag1', title: 'Tag 1' },
        { slug: 'tag2', title: 'Tag 2' },
      ]);
      expectAuditorSuccess();
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
        active: false,
        sortBy: 'created_at',
        order: 'desc',
        current: undefined,
        tags: ['nonexistent'],
      });

      expect(response.body.results).toHaveLength(0);
      expect(response.body.count).toEqual(0);
      expectAuditorSuccess();
    });
  });

  describe('GET /announcements/:id', () => {
    it('returns the announcement', async () => {
      announcementByIDMock.mockResolvedValueOnce(announcement);

      const response = await request(app).get('/announcements/uuid');

      expect(response.status).toEqual(200);
      expect(response.body).toMatchObject({ id: 'uuid', title: 'title' });
      expect(announcementByIDMock).toHaveBeenCalledWith('uuid');
      expect(auditorMock.createEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventId: AUDITOR_FETCH_EVENT_ID,
          severityLevel: 'low',
          meta: { queryType: 'by-id', uid: 'uuid' },
        }),
      );
      expectAuditorSuccess();
    });

    it('fails the audit event when the lookup throws', async () => {
      const error = new Error('boom');
      announcementByIDMock.mockRejectedValueOnce(error);

      const response = await request(app).get('/announcements/uuid');

      expect(response.status).toEqual(500);
      expectAuditorFailure(error);
    });
  });

  describe('DELETE /announcements/:id', () => {
    it('deletes the announcement and publishes an event', async () => {
      announcementByIDMock.mockResolvedValueOnce(announcement);

      const response = await request(app).delete('/announcements/uuid');

      expect(response.status).toEqual(204);
      expect(deleteAnnouncementByIDMock).toHaveBeenCalledWith('uuid');
      expect(mockEvents.publish).toHaveBeenCalledWith({
        topic: EVENTS_TOPIC_ANNOUNCEMENTS,
        eventPayload: {
          announcement: expect.objectContaining({ id: 'uuid' }),
        },
        metadata: { action: EVENTS_ACTION_DELETE_ANNOUNCEMENT },
      });
      expect(auditorMock.createEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventId: AUDITOR_MUTATE_EVENT_ID,
          severityLevel: 'medium',
          meta: { actionType: AUDITOR_ACTION_DELETE, uid: 'uuid' },
        }),
      );
      expectAuditorSuccess();
    });

    it('returns 404 when the announcement does not exist', async () => {
      announcementByIDMock.mockResolvedValueOnce(undefined);

      const response = await request(app).delete('/announcements/missing');

      expect(response.status).toEqual(404);
      expect(deleteAnnouncementByIDMock).not.toHaveBeenCalled();
      expect(mockEvents.publish).not.toHaveBeenCalled();
      expectAuditorFailure(expect.any(NotFoundError));
    });
  });

  describe('POST /announcements', () => {
    const payload = {
      title: 'title',
      excerpt: 'excerpt',
      body: 'body',
      publisher: 'user:default/name',
      active: true,
      start_at: '2025-01-01T00:00:00.000Z',
      until_date: '2025-02-01T00:00:00.000Z',
      sendNotification: true,
      tags: [' Foo Bar ', 'Baz'],
    };

    it('creates an active announcement, signals it and sends a notification', async () => {
      insertAnnouncementMock.mockResolvedValueOnce(announcement);

      const response = await request(app).post('/announcements').send(payload);

      expect(response.status).toEqual(201);
      expect(response.body).toMatchObject({ id: 'uuid', title: 'title' });
      expect(insertAnnouncementMock).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.any(String),
          title: 'title',
          start_at: expect.any(DateTime),
          until_date: expect.any(DateTime),
          tags: ['foo-bar', 'baz'],
        }),
      );
      expect(mockEvents.publish).toHaveBeenCalledWith({
        topic: EVENTS_TOPIC_ANNOUNCEMENTS,
        eventPayload: {
          announcement: expect.objectContaining({ id: 'uuid' }),
        },
        metadata: { action: EVENTS_ACTION_CREATE_ANNOUNCEMENT },
      });
      expect(mockSignals.publish).toHaveBeenCalledWith(
        expect.objectContaining({ channel: SIGNALS_CHANNEL_ANNOUNCEMENTS }),
      );
      expect(mockNotificationService.send).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: expect.objectContaining({
            title: 'New Announcement "title"',
            link: '/announcements/view/uuid',
          }),
        }),
      );
      expect(auditorMock.createEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventId: AUDITOR_MUTATE_EVENT_ID,
          severityLevel: 'medium',
          meta: { actionType: AUDITOR_ACTION_CREATE, withNotification: true },
        }),
      );
      expectAuditorSuccess();
    });

    it('does not signal or notify for an inactive announcement', async () => {
      insertAnnouncementMock.mockResolvedValueOnce({
        ...announcement,
        active: false,
      });

      const response = await request(app)
        .post('/announcements')
        .send({ ...payload, active: false });

      expect(response.status).toEqual(201);
      expect(mockEvents.publish).toHaveBeenCalledTimes(1);
      expect(mockSignals.publish).not.toHaveBeenCalled();
      expect(mockNotificationService.send).not.toHaveBeenCalled();
      expectAuditorSuccess();
    });

    it('rejects an until_date before start_at', async () => {
      const response = await request(app)
        .post('/announcements')
        .send({ ...payload, until_date: '2024-12-01T00:00:00.000Z' });

      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        error: 'until_date cannot be before start_at',
      });
      expect(insertAnnouncementMock).not.toHaveBeenCalled();
    });

    it('returns 500 and fails the audit event when saving fails', async () => {
      const error = new Error('boom');
      insertAnnouncementMock.mockRejectedValueOnce(error);

      const response = await request(app).post('/announcements').send(payload);

      expect(response.status).toEqual(500);
      expect(response.body).toEqual({ error: 'Failed to create announcement' });
      expect(mockEvents.publish).not.toHaveBeenCalled();
      expectAuditorFailure(error);
    });
  });

  describe('PUT /announcements/:id', () => {
    const payload = {
      title: 'updated title',
      excerpt: 'excerpt',
      body: 'body',
      publisher: 'user:default/name',
      active: true,
      start_at: '2025-01-01T00:00:00.000Z',
      until_date: '2025-02-01T00:00:00.000Z',
      sendNotification: true,
      tags: ['New Tag'],
    };

    it('updates the announcement and signals it when it becomes active', async () => {
      announcementByIDMock.mockResolvedValueOnce({
        ...announcement,
        active: false,
      });
      updateAnnouncementMock.mockResolvedValueOnce({
        ...announcement,
        title: 'updated title',
      });

      const response = await request(app)
        .put('/announcements/uuid')
        .send(payload);

      expect(response.status).toEqual(200);
      expect(response.body).toMatchObject({
        id: 'uuid',
        title: 'updated title',
      });
      expect(updateAnnouncementMock).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'uuid',
          title: 'updated title',
          active: true,
          start_at: expect.any(DateTime),
          until_date: expect.any(DateTime),
          tags: ['new-tag'],
        }),
      );
      expect(mockEvents.publish).toHaveBeenCalledWith({
        topic: EVENTS_TOPIC_ANNOUNCEMENTS,
        eventPayload: {
          announcement: expect.objectContaining({ id: 'uuid' }),
        },
        metadata: { action: EVENTS_ACTION_UPDATE_ANNOUNCEMENT },
      });
      expect(mockSignals.publish).toHaveBeenCalledTimes(1);
      expect(mockNotificationService.send).toHaveBeenCalledTimes(1);
      expect(auditorMock.createEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventId: AUDITOR_MUTATE_EVENT_ID,
          severityLevel: 'medium',
          meta: { actionType: AUDITOR_ACTION_UPDATE, uid: 'uuid' },
        }),
      );
      expectAuditorSuccess();
    });

    it('does not signal or notify when the announcement was already active', async () => {
      announcementByIDMock.mockResolvedValueOnce(announcement);
      updateAnnouncementMock.mockResolvedValueOnce(announcement);

      const response = await request(app)
        .put('/announcements/uuid')
        .send(payload);

      expect(response.status).toEqual(200);
      expect(mockEvents.publish).toHaveBeenCalledTimes(1);
      expect(mockSignals.publish).not.toHaveBeenCalled();
      expect(mockNotificationService.send).not.toHaveBeenCalled();
      expectAuditorSuccess();
    });

    it('rejects an until_date before start_at', async () => {
      const response = await request(app)
        .put('/announcements/uuid')
        .send({ ...payload, until_date: '2024-12-01T00:00:00.000Z' });

      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        error: 'until_date cannot be before start_at',
      });
      expect(announcementByIDMock).not.toHaveBeenCalled();
      expect(updateAnnouncementMock).not.toHaveBeenCalled();
    });

    it('returns 404 when the announcement does not exist', async () => {
      announcementByIDMock.mockResolvedValueOnce(undefined);

      const response = await request(app)
        .put('/announcements/missing')
        .send(payload);

      expect(response.status).toEqual(404);
      expect(updateAnnouncementMock).not.toHaveBeenCalled();
      expect(mockEvents.publish).not.toHaveBeenCalled();
      expectAuditorFailure(expect.any(NotFoundError));
    });
  });

  describe('categories', () => {
    it('lists categories', async () => {
      categoriesMock.mockResolvedValueOnce([
        { title: 'Category', slug: 'category' },
      ]);

      const response = await request(app).get('/categories');

      expect(response.status).toEqual(200);
      expect(response.body).toEqual([{ title: 'Category', slug: 'category' }]);
      expect(auditorMock.createEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventId: AUDITOR_FETCH_EVENT_ID,
          severityLevel: 'low',
          meta: { queryType: 'all' },
        }),
      );
      expectAuditorSuccess();
    });

    it('fails the audit event when listing categories throws', async () => {
      const error = new Error('boom');
      categoriesMock.mockRejectedValueOnce(error);

      const response = await request(app).get('/categories');

      expect(response.status).toEqual(500);
      expectAuditorFailure(error);
    });

    it('records a create action when a category is created', async () => {
      const response = await request(app)
        .post('/categories')
        .send({ title: 'New Category' });

      expect(response.status).toEqual(201);
      expect(response.body).toEqual({
        title: 'New Category',
        slug: 'new-category',
      });
      expect(insertCategoryMock).toHaveBeenCalledWith({
        title: 'New Category',
        slug: 'new-category',
      });
      expect(mockEvents.publish).toHaveBeenCalledWith({
        topic: EVENTS_TOPIC_ANNOUNCEMENTS,
        eventPayload: { category: 'new-category' },
        metadata: { action: EVENTS_ACTION_CREATE_CATEGORY },
      });
      expect(auditorMock.createEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventId: AUDITOR_MUTATE_EVENT_ID,
          severityLevel: 'medium',
          meta: { actionType: AUDITOR_ACTION_CREATE },
        }),
      );
      expectAuditorSuccess();
    });

    it('records a delete action when a category is deleted', async () => {
      announcementsMock.mockResolvedValueOnce({ results: [], count: 0 });

      const response = await request(app).delete('/categories/old-category');

      expect(response.status).toEqual(204);
      expect(announcementsMock).toHaveBeenCalledWith({
        category: 'old-category',
      });
      expect(deleteCategoryMock).toHaveBeenCalledWith('old-category');
      expect(mockEvents.publish).toHaveBeenCalledWith({
        topic: EVENTS_TOPIC_ANNOUNCEMENTS,
        eventPayload: { category: 'old-category' },
        metadata: { action: EVENTS_ACTION_DELETE_CATEGORY },
      });
      expect(auditorMock.createEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventId: AUDITOR_MUTATE_EVENT_ID,
          severityLevel: 'medium',
          meta: { actionType: AUDITOR_ACTION_DELETE },
        }),
      );
      expectAuditorSuccess();
    });

    it('refuses to delete a category used by announcements', async () => {
      announcementsMock.mockResolvedValueOnce({
        results: [announcement],
        count: 1,
      });

      const response = await request(app).delete('/categories/used-category');

      expect(response.status).toEqual(403);
      expect(deleteCategoryMock).not.toHaveBeenCalled();
      expect(mockEvents.publish).not.toHaveBeenCalled();
      expectAuditorFailure(expect.any(NotAllowedError));
    });
  });

  describe('tags', () => {
    it('lists tags', async () => {
      tagsMock.mockResolvedValueOnce([{ title: 'Tag', slug: 'tag' }]);

      const response = await request(app).get('/tags');

      expect(response.status).toEqual(200);
      expect(response.body).toEqual([{ title: 'Tag', slug: 'tag' }]);
      expect(auditorMock.createEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventId: AUDITOR_FETCH_EVENT_ID,
          severityLevel: 'low',
          meta: { queryType: 'all' },
        }),
      );
      expectAuditorSuccess();
    });

    it('fails the audit event when listing tags throws', async () => {
      const error = new Error('boom');
      tagsMock.mockRejectedValueOnce(error);

      const response = await request(app).get('/tags');

      expect(response.status).toEqual(500);
      expectAuditorFailure(error);
    });

    it.each([
      ['a missing title', {}, 'Title is required'],
      ['a blank title', { title: '   ' }, 'Title is required'],
      [
        'a title that is too long',
        { title: 'a'.repeat(MAX_TITLE_TAG_LENGTH + 1) },
        'Title exceeds maximum length',
      ],
    ])('rejects %s', async (_, body, message) => {
      const response = await request(app).post('/tags').send(body);

      expect(response.status).toEqual(400);
      expect(response.body).toEqual({ error: message });
      expect(tagBySlugMock).not.toHaveBeenCalled();
      expect(insertTagMock).not.toHaveBeenCalled();
      expectAuditorFailure(expect.any(InputError));
    });

    it('returns 409 when the tag already exists', async () => {
      tagBySlugMock.mockResolvedValueOnce({
        title: 'New Tag',
        slug: 'new-tag',
      });

      const response = await request(app)
        .post('/tags')
        .send({ title: 'New Tag' });

      expect(response.status).toEqual(409);
      expect(response.body).toEqual({ error: 'Tag already exists' });
      expect(insertTagMock).not.toHaveBeenCalled();
      expectAuditorFailure(expect.any(InputError));
    });

    it('records a create action when a tag is created', async () => {
      tagBySlugMock.mockResolvedValueOnce(undefined);

      const response = await request(app)
        .post('/tags')
        .send({ title: 'New Tag' });

      expect(response.status).toEqual(201);
      expect(response.body).toEqual({ title: 'New Tag', slug: 'new-tag' });
      expect(insertTagMock).toHaveBeenCalledWith({
        title: 'New Tag',
        slug: 'new-tag',
      });

      expect(auditorMock.createEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventId: AUDITOR_MUTATE_EVENT_ID,
          severityLevel: 'medium',
          meta: expect.objectContaining({
            actionType: AUDITOR_ACTION_CREATE,
          }),
        }),
      );
      expectAuditorSuccess();
    });

    it('records a delete action when a tag is deleted', async () => {
      announcementsMock.mockReturnValueOnce({ results: [], count: 0 });
      tagBySlugMock.mockResolvedValueOnce({
        title: 'Old Tag',
        slug: 'old-tag',
      });

      const response = await request(app).delete('/tags/old-tag');

      expect(response.status).toEqual(204);
      expect(deleteTagMock).toHaveBeenCalledWith('old-tag');

      expect(auditorMock.createEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventId: AUDITOR_MUTATE_EVENT_ID,
          severityLevel: 'medium',
          meta: expect.objectContaining({
            actionType: AUDITOR_ACTION_DELETE,
          }),
        }),
      );
      expectAuditorSuccess();
    });

    it('refuses to delete a tag used by announcements', async () => {
      announcementsMock.mockResolvedValueOnce({
        results: [announcement],
        count: 1,
      });

      const response = await request(app).delete('/tags/used-tag');

      expect(response.status).toEqual(403);
      expect(announcementsMock).toHaveBeenCalledWith({ tags: ['used-tag'] });
      expect(deleteTagMock).not.toHaveBeenCalled();
      expectAuditorFailure(expect.any(NotAllowedError));
    });

    it('returns 404 when deleting a tag that does not exist', async () => {
      announcementsMock.mockResolvedValueOnce({ results: [], count: 0 });
      tagBySlugMock.mockResolvedValueOnce(undefined);

      const response = await request(app).delete('/tags/missing-tag');

      expect(response.status).toEqual(404);
      expect(response.body).toEqual({ error: 'Tag not found' });
      expect(deleteTagMock).not.toHaveBeenCalled();
      expectAuditorFailure(expect.any(NotFoundError));
    });
  });

  describe('permissions', () => {
    const {
      announcementCreatePermission,
      announcementDeletePermission,
      announcementUpdatePermission,
    } = announcementEntityPermissions;

    it.each([
      ['delete', '/announcements/uuid', announcementDeletePermission],
      ['post', '/announcements', announcementCreatePermission],
      ['put', '/announcements/uuid', announcementUpdatePermission],
      ['post', '/categories', announcementCreatePermission],
      ['delete', '/categories/slug', announcementDeletePermission],
      ['post', '/tags', announcementCreatePermission],
      ['delete', '/tags/slug', announcementDeletePermission],
    ] as const)(
      'rejects unauthorized %s %s',
      async (method, path, permission) => {
        (mockPermissions.authorize as jest.Mock).mockResolvedValueOnce([
          { result: AuthorizeResult.DENY },
        ]);

        const response = await request(app)[method](path).send({
          title: 'title',
        });

        expect(response.status).toEqual(403);
        expect(mockPermissions.authorize).toHaveBeenCalledWith(
          [{ permission }],
          { credentials: mockCredentials },
        );
        [
          announcementsMock,
          announcementByIDMock,
          deleteAnnouncementByIDMock,
          insertAnnouncementMock,
          updateAnnouncementMock,
          insertCategoryMock,
          deleteCategoryMock,
          tagBySlugMock,
          insertTagMock,
          deleteTagMock,
        ].forEach(storeMock => expect(storeMock).not.toHaveBeenCalled());
        expect(mockEvents.publish).not.toHaveBeenCalled();
        expectAuditorFailure(expect.any(NotAllowedError));
      },
    );
  });
});
