import { getVoidLogger } from '@backstage/backend-common';
import express from 'express';
import { DateTime } from 'luxon';
import request from 'supertest';
import { AnnouncementsContext } from './announcementsContextBuilder';
import { AnnouncementModel } from './model';
import { AnnouncementsDatabase } from './persistence/AnnouncementsDatabase';
import { PersistenceContext } from './persistence/persistenceContext';
import { createRouter } from './router';
import { CategoriesDatabase } from './persistence/CategoriesDatabase';
import {
  HttpAuthService,
  PermissionsService,
} from '@backstage/backend-plugin-api';

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
      logger: getVoidLogger(),
      persistenceContext: mockPersistenceContext,
      permissions: mockPermissions,
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
        },
      ] as AnnouncementModel[]);

      const response = await request(app).get('/announcements');

      expect(response.status).toEqual(200);
      expect(announcementsMock).toHaveBeenCalledWith({});
      expect(response.body).toEqual([
        {
          id: 'uuid',
          title: 'title',
          excerpt: 'excerpt',
          body: 'body',
          publisher: 'user:default/name',
          created_at: '2022-11-02T15:28:08.539+00:00',
        },
      ]);
    });
  });
});
