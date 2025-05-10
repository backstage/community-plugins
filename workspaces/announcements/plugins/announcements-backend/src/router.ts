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
import express, { Request } from 'express';
import Router from 'express-promise-router';
import { DateTime } from 'luxon';
import slugify from 'slugify';
import { v4 as uuid } from 'uuid';
import { MiddlewareFactory } from '@backstage/backend-defaults/rootHttpRouter';
import { NotAllowedError } from '@backstage/errors';
import {
  AuthorizeResult,
  BasicPermission,
} from '@backstage/plugin-permission-common';
import {
  announcementCreatePermission,
  announcementDeletePermission,
  announcementUpdatePermission,
  announcementEntityPermissions,
  EVENTS_TOPIC_ANNOUNCEMENTS,
  EVENTS_ACTION_CREATE_ANNOUNCEMENT,
  EVENTS_ACTION_DELETE_ANNOUNCEMENT,
  EVENTS_ACTION_UPDATE_ANNOUNCEMENT,
  EVENTS_ACTION_CREATE_CATEGORY,
  EVENTS_ACTION_DELETE_CATEGORY,
} from '@backstage-community/plugin-announcements-common';
import { createPermissionIntegrationRouter } from '@backstage/plugin-permission-node';
import { signalAnnouncement } from './service/signal';
import { AnnouncementsContext } from './service';

interface AnnouncementRequest {
  publisher: string;
  category?: string;
  title: string;
  excerpt: string;
  body: string;
  active: boolean;
  start_at: string;
  on_behalf_of?: string;
}

interface CategoryRequest {
  title: string;
}

type GetAnnouncementsQueryParams = {
  category?: string;
  page?: number;
  max?: number;
  active?: boolean;
  sortby?: 'created_at' | 'start_at';
  order?: 'asc' | 'desc';
};

export async function createRouter(
  context: AnnouncementsContext,
): Promise<express.Router> {
  const {
    persistenceContext,
    permissions,
    httpAuth,
    config,
    logger,
    events,
    signals,
  } = context;

  const permissionIntegrationRouter = createPermissionIntegrationRouter({
    permissions: Object.values(announcementEntityPermissions),
  });

  const isRequestAuthorized = async (
    req: Request,
    permission: BasicPermission,
  ): Promise<boolean> => {
    const credentials = await httpAuth.credentials(req);

    const decision = (
      await permissions.authorize([{ permission: permission }], {
        credentials,
      })
    )[0];

    return decision.result !== AuthorizeResult.DENY;
  };

  const router = Router();
  router.use(express.json());
  router.use(permissionIntegrationRouter);

  router.get(
    '/announcements',
    async (req: Request<{}, {}, {}, GetAnnouncementsQueryParams>, res) => {
      const {
        query: {
          category,
          max,
          page,
          active,
          sortby = 'created_at',
          order = 'desc',
        },
      } = req;

      const results = await persistenceContext.announcementsStore.announcements(
        {
          category,
          max,
          offset: page ? (page - 1) * (max ?? 10) : undefined,
          active,
          sortBy: ['created_at', 'start_at'].includes(sortby)
            ? sortby
            : 'created_at',
          order: ['asc', 'desc'].includes(order) ? order : 'desc',
        },
      );

      return res.json(results);
    },
  );

  router.get(
    '/announcements/:id',
    async (req: Request<{ id: string }, {}, {}, {}>, res) => {
      const result =
        await persistenceContext.announcementsStore.announcementByID(
          req.params.id,
        );

      return res.json(result);
    },
  );

  router.delete(
    '/announcements/:id',
    async (req: Request<{ id: string }, {}, {}, {}>, res) => {
      if (!(await isRequestAuthorized(req, announcementDeletePermission))) {
        throw new NotAllowedError('Unauthorized');
      }

      const announcement =
        await persistenceContext.announcementsStore.announcementByID(
          req.params.id,
        );

      if (!announcement) {
        logger.warn('Announcement not found', { id: req.params.id });
        return res.status(404).end();
      }

      await persistenceContext.announcementsStore.deleteAnnouncementByID(
        req.params.id,
      );

      if (events) {
        events.publish({
          topic: EVENTS_TOPIC_ANNOUNCEMENTS,
          eventPayload: {
            announcement,
          },
          metadata: { action: EVENTS_ACTION_DELETE_ANNOUNCEMENT },
        });
      }

      return res.status(204).end();
    },
  );

  router.post(
    '/announcements',
    async (req: Request<{}, {}, AnnouncementRequest, {}>, res) => {
      if (!(await isRequestAuthorized(req, announcementCreatePermission))) {
        throw new NotAllowedError('Unauthorized');
      }

      const announcement =
        await persistenceContext.announcementsStore.insertAnnouncement({
          ...req.body,
          ...{
            id: uuid(),
            created_at: DateTime.now(),
            start_at: DateTime.fromISO(req.body.start_at),
          },
        });

      if (events) {
        events.publish({
          topic: EVENTS_TOPIC_ANNOUNCEMENTS,
          eventPayload: {
            announcement,
          },
          metadata: { action: EVENTS_ACTION_CREATE_ANNOUNCEMENT },
        });

        await signalAnnouncement(announcement, signals);
      }

      return res.status(201).json(announcement);
    },
  );

  router.put(
    '/announcements/:id',
    async (req: Request<{ id: string }, {}, AnnouncementRequest, {}>, res) => {
      if (!(await isRequestAuthorized(req, announcementUpdatePermission))) {
        throw new NotAllowedError('Unauthorized');
      }

      const {
        params: { id },
        body: {
          title,
          excerpt,
          body,
          publisher,
          category,
          active,
          start_at,
          on_behalf_of,
        },
      } = req;

      const initialAnnouncement =
        await persistenceContext.announcementsStore.announcementByID(id);
      if (!initialAnnouncement) {
        return res.status(404).end();
      }

      const announcement =
        await persistenceContext.announcementsStore.updateAnnouncement({
          ...initialAnnouncement,
          ...{
            title,
            excerpt,
            body,
            publisher,
            category,
            active,
            start_at: DateTime.fromISO(start_at),
            on_behalf_of,
          },
        });

      if (events) {
        events.publish({
          topic: EVENTS_TOPIC_ANNOUNCEMENTS,
          eventPayload: {
            announcement,
          },
          metadata: { action: EVENTS_ACTION_UPDATE_ANNOUNCEMENT },
        });
      }

      return res.status(200).json(announcement);
    },
  );

  router.get('/categories', async (_req, res) => {
    const results = await persistenceContext.categoriesStore.categories();

    return res.json(results);
  });

  router.post(
    '/categories',
    async (req: Request<{}, {}, CategoryRequest, {}>, res) => {
      if (!(await isRequestAuthorized(req, announcementCreatePermission))) {
        throw new NotAllowedError('Unauthorized');
      }

      const category = {
        ...req.body,
        ...{
          slug: slugify(req.body.title, {
            lower: true,
          }),
        },
      };

      await persistenceContext.categoriesStore.insert(category);

      if (events) {
        events.publish({
          topic: EVENTS_TOPIC_ANNOUNCEMENTS,
          eventPayload: {
            category: category.slug,
          },
          metadata: { action: EVENTS_ACTION_CREATE_CATEGORY },
        });
      }

      return res.status(201).json(category);
    },
  );

  router.delete(
    '/categories/:slug',
    async (req: Request<{ slug: string }, {}, {}, {}>, res) => {
      if (!(await isRequestAuthorized(req, announcementDeletePermission))) {
        throw new NotAllowedError('Unauthorized');
      }
      const announcementsByCategory =
        await persistenceContext.announcementsStore.announcements({
          category: req.params.slug,
        });

      if (announcementsByCategory.count) {
        throw new NotAllowedError(
          'Category to delete is used in some announcements',
        );
      }
      await persistenceContext.categoriesStore.delete(req.params.slug);

      if (events) {
        events.publish({
          topic: EVENTS_TOPIC_ANNOUNCEMENTS,
          eventPayload: {
            category: req.params.slug,
          },
          metadata: { action: EVENTS_ACTION_DELETE_CATEGORY },
        });
      }

      return res.status(204).end();
    },
  );

  router.use(MiddlewareFactory.create({ config, logger }).error());

  return router;
}
