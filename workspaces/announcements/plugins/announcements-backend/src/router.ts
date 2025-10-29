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
import { InputError, NotAllowedError, NotFoundError } from '@backstage/errors';
import {
  AuthorizeResult,
  BasicPermission,
} from '@backstage/plugin-permission-common';
import {
  announcementEntityPermissions,
  EVENTS_TOPIC_ANNOUNCEMENTS,
  EVENTS_ACTION_CREATE_ANNOUNCEMENT,
  EVENTS_ACTION_DELETE_ANNOUNCEMENT,
  EVENTS_ACTION_UPDATE_ANNOUNCEMENT,
  EVENTS_ACTION_CREATE_CATEGORY,
  EVENTS_ACTION_DELETE_CATEGORY,
  EVENTS_ACTION_CREATE_TAG,
  EVENTS_ACTION_DELETE_TAG,
  MAX_TITLE_TAG_LENGTH,
  AUDITOR_MUTATE_EVENT_ID,
  AUDITOR_ACTION_CREATE,
  AUDITOR_ACTION_UPDATE,
  AUDITOR_ACTION_DELETE,
  AUDITOR_FETCH_EVENT_ID,
} from '@backstage-community/plugin-announcements-common';
import { signalAnnouncement } from './service/signal';
import { AnnouncementsContext } from './service';
import { sendAnnouncementNotification } from './service/announcementNotification';

interface AnnouncementRequest {
  publisher: string;
  category?: string;
  title: string;
  excerpt: string;
  body: string;
  active: boolean;
  start_at: string;
  until_date?: string;
  sendNotification: boolean;
  on_behalf_of?: string;
  tags?: string[];
}

interface CategoryRequest {
  title: string;
}

interface TagsRequest {
  title: string;
}

type GetAnnouncementsQueryParams = {
  category?: string;
  page?: number;
  max?: number;
  active?: string;
  sortby?: 'created_at' | 'start_at' | 'updated_at';
  order?: 'asc' | 'desc';
  current?: boolean;
  tags?: string[];
};

export async function createRouter(
  context: AnnouncementsContext,
): Promise<express.Router> {
  const {
    config,
    events,
    httpAuth,
    logger,
    persistenceContext,
    permissions,
    auditor,
    signals,
    notifications,
  } = context;

  const {
    announcementCreatePermission,
    announcementDeletePermission,
    announcementUpdatePermission,
  } = announcementEntityPermissions;

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

  router.get(
    '/announcements',
    async (
      req: Request<{}, {}, {}, GetAnnouncementsQueryParams & { tags?: string }>,
      res,
    ) => {
      const auditorEvent = await auditor.createEvent({
        eventId: AUDITOR_FETCH_EVENT_ID,
        request: req,
        severityLevel: 'low',
        meta: {
          queryType: req.query.category ? 'by-category' : 'all',
          category: req.query.category,
          tags: req.query.tags,
        },
      });
      const {
        query: {
          category,
          max,
          page,
          active,
          sortby = 'created_at',
          order = 'desc',
          current,
          tags,
        },
      } = req;

      const tagsFilter = tags ? tags.split(',') : undefined;

      const results = await persistenceContext.announcementsStore.announcements(
        {
          category,
          max,
          offset: page ? (page - 1) * (max ?? 10) : undefined,
          active: active === 'true',
          sortBy: ['created_at', 'start_at', 'updated_at'].includes(sortby)
            ? sortby
            : 'created_at',
          order: ['asc', 'desc'].includes(order) ? order : 'desc',
          current,
          tags: tagsFilter,
        },
      );
      await auditorEvent.success();
      return res.json(results);
    },
  );

  router.get(
    '/announcements/:id',
    async (req: Request<{ id: string }, {}, {}, {}>, res) => {
      const auditorEvent = await auditor.createEvent({
        eventId: AUDITOR_FETCH_EVENT_ID,
        request: req,
        severityLevel: 'low',
        meta: {
          queryType: 'by-id',
          uid: req.params.id,
        },
      });
      try {
        const result =
          await persistenceContext.announcementsStore.announcementByID(
            req.params.id,
          );
        await auditorEvent.success();
        return res.json(result);
      } catch (err) {
        await auditorEvent.fail({ error: err });
        throw err;
      }
    },
  );

  router.delete(
    '/announcements/:id',
    async (req: Request<{ id: string }, {}, {}, {}>, res) => {
      const auditorEvent = await auditor.createEvent({
        eventId: AUDITOR_MUTATE_EVENT_ID,
        request: req,
        severityLevel: 'medium',
        meta: {
          actionType: AUDITOR_ACTION_DELETE,
          uid: req.params.id,
        },
      });

      if (!(await isRequestAuthorized(req, announcementDeletePermission))) {
        const error = new NotAllowedError('Unauthorized');
        await auditorEvent.fail({ error });
        throw error;
      }
      try {
        const announcement =
          await persistenceContext.announcementsStore.announcementByID(
            req.params.id,
          );

        if (!announcement) {
          const error = new NotFoundError('Announcement not found');
          logger.warn('Announcement not found', { uid: req.params.id });
          await auditorEvent.fail({ error });
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

        await auditorEvent.success();
        return res.status(204).end();
      } catch (err) {
        await auditorEvent.fail({ error: err });
        throw err;
      }
    },
  );

  router.post(
    '/announcements',
    async (req: Request<{}, {}, AnnouncementRequest, {}>, res) => {
      const auditorEvent = await auditor.createEvent({
        eventId: AUDITOR_MUTATE_EVENT_ID,
        request: req,
        severityLevel: 'medium',
        meta: {
          actionType: AUDITOR_ACTION_CREATE,
          withNotification: req.body?.sendNotification ?? false,
        },
      });

      if (!(await isRequestAuthorized(req, announcementCreatePermission))) {
        const error = new NotAllowedError('Unauthorized');
        await auditorEvent.fail({ error });
        throw error;
      }
      try {
        const startAt = DateTime.fromISO(req.body.start_at);
        const untilDate = req.body.until_date
          ? DateTime.fromISO(req.body.until_date)
          : undefined;

        if (untilDate && untilDate < startAt) {
          return res
            .status(400)
            .json({ error: 'until_date cannot be before start_at' });
        }

        // Normalize tags by slugifying each tag value
        const validatedTags =
          req.body.tags && Array.isArray(req.body.tags)
            ? req.body.tags.map(tag => slugify(tag.trim(), { lower: true }))
            : [];

        const announcement =
          await persistenceContext.announcementsStore.insertAnnouncement({
            ...req.body,
            id: uuid(),
            created_at: DateTime.now(),
            updated_at: DateTime.now(),
            start_at: startAt,
            until_date: untilDate,
            tags: validatedTags,
          });

        if (events) {
          events.publish({
            topic: EVENTS_TOPIC_ANNOUNCEMENTS,
            eventPayload: {
              announcement,
            },
            metadata: { action: EVENTS_ACTION_CREATE_ANNOUNCEMENT },
          });

          if (announcement.active) {
            await signalAnnouncement(announcement, signals);
            const announcementNotificationsEnabled =
              req.body?.sendNotification === true;
            if (announcementNotificationsEnabled) {
              await sendAnnouncementNotification(announcement, notifications);
            }
          }
        }

        await auditorEvent.success();
        return res.status(201).json(announcement);
      } catch (err) {
        await auditorEvent.fail({ error: err });
        return res.status(500).json({ error: 'Failed to create announcement' });
      }
    },
  );

  router.put(
    '/announcements/:id',
    async (req: Request<{ id: string }, {}, AnnouncementRequest, {}>, res) => {
      const auditorEvent = await auditor.createEvent({
        eventId: AUDITOR_MUTATE_EVENT_ID,
        request: req,
        severityLevel: 'medium',
        meta: {
          actionType: AUDITOR_ACTION_UPDATE,
          uid: req.params.id,
        },
      });

      if (!(await isRequestAuthorized(req, announcementUpdatePermission))) {
        const error = new NotAllowedError('Unauthorized');
        await auditorEvent.fail({ error });
        throw error;
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
          until_date,
          on_behalf_of,
          tags,
        },
      } = req;

      if (until_date && until_date < start_at) {
        return res
          .status(400)
          .json({ error: 'until_date cannot be before start_at' });
      }

      const initialAnnouncement =
        await persistenceContext.announcementsStore.announcementByID(id);
      if (!initialAnnouncement) {
        await auditorEvent.fail({
          error: new NotFoundError('Announcement not found'),
        });
        return res.status(404).end();
      }

      // Normalize tags by slugifying each tag value
      const validatedTags =
        tags && Array.isArray(tags)
          ? tags.map(tag => slugify(tag.trim(), { lower: true }))
          : [];

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
            updated_at: DateTime.now(),
            start_at: DateTime.fromISO(start_at),
            until_date: until_date ? DateTime.fromISO(until_date) : undefined,
            on_behalf_of,
            tags: validatedTags,
          },
        });

      if (events) {
        events.publish({
          topic: EVENTS_TOPIC_ANNOUNCEMENTS,
          eventPayload: { announcement },
          metadata: { action: EVENTS_ACTION_UPDATE_ANNOUNCEMENT },
        });
      }

      if (!initialAnnouncement.active && active) {
        await signalAnnouncement(announcement, signals);
        const announcementNotificationsEnabled =
          req.body?.sendNotification === true;
        if (announcementNotificationsEnabled) {
          await sendAnnouncementNotification(announcement, notifications);
        }
      }

      await auditorEvent.success();
      return res.status(200).json(announcement);
    },
  );

  router.get('/categories', async (_req, res) => {
    const auditorEvent = await auditor.createEvent({
      eventId: AUDITOR_FETCH_EVENT_ID,
      request: _req,
      severityLevel: 'low',
      meta: {
        queryType: 'all',
      },
    });
    try {
      const results = await persistenceContext.categoriesStore.categories();
      await auditorEvent.success();
      return res.json(results);
    } catch (err) {
      await auditorEvent.fail({ error: err });
      throw err;
    }
  });

  router.post(
    '/categories',
    async (req: Request<{}, {}, CategoryRequest, {}>, res) => {
      const auditorEvent = await auditor.createEvent({
        eventId: AUDITOR_MUTATE_EVENT_ID,
        request: req,
        severityLevel: 'medium',
        meta: {
          actionType: AUDITOR_ACTION_CREATE,
        },
      });

      if (!(await isRequestAuthorized(req, announcementCreatePermission))) {
        const error = new NotAllowedError('Unauthorized');
        await auditorEvent.fail({ error });
        throw error;
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

      await auditorEvent.success();
      return res.status(201).json(category);
    },
  );

  router.delete(
    '/categories/:slug',
    async (req: Request<{ slug: string }, {}, {}, {}>, res) => {
      const auditorEvent = await auditor.createEvent({
        eventId: AUDITOR_MUTATE_EVENT_ID,
        request: req,
        severityLevel: 'medium',
        meta: {
          actionType: AUDITOR_ACTION_UPDATE,
        },
      });

      if (!(await isRequestAuthorized(req, announcementDeletePermission))) {
        const error = new NotAllowedError('Unauthorized');
        await auditorEvent.fail({ error });
        throw error;
      }
      const announcementsByCategory =
        await persistenceContext.announcementsStore.announcements({
          category: req.params.slug,
        });

      if (announcementsByCategory.count) {
        const error = new NotAllowedError(
          'Category to delete is used in some announcements',
        );
        await auditorEvent.fail({ error });
        throw error;
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

      await auditorEvent.success();
      return res.status(204).end();
    },
  );

  router.get('/tags', async (_req, res) => {
    const auditorEvent = await auditor.createEvent({
      eventId: AUDITOR_FETCH_EVENT_ID,
      request: _req,
      severityLevel: 'low',
      meta: {
        queryType: 'all',
      },
    });
    try {
      const results = await persistenceContext.tagsStore.tags();
      await auditorEvent.success();
      return res.json(results);
    } catch (err) {
      await auditorEvent.fail({ error: err });
      throw err;
    }
  });

  router.post('/tags', async (req: Request<{}, {}, TagsRequest, {}>, res) => {
    const auditorEvent = await auditor.createEvent({
      eventId: AUDITOR_MUTATE_EVENT_ID,
      request: req,
      severityLevel: 'medium',
      meta: {
        actionType: AUDITOR_ACTION_UPDATE,
      },
    });

    if (!(await isRequestAuthorized(req, announcementCreatePermission))) {
      const error = new NotAllowedError('Unauthorized');
      await auditorEvent.fail({ error });
      throw error;
    }

    const title = req.body.title;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      const error = new InputError('Title is required');
      await auditorEvent.fail({ error });
      return res.status(400).json({ error: error.message });
    }

    if (title.length > MAX_TITLE_TAG_LENGTH) {
      const error = new InputError('Title exceeds maximum length');
      await auditorEvent.fail({ error });
      return res.status(400).json({ error: error.message });
    }

    const slug = slugify(title, { lower: true });

    const existingTag = await persistenceContext.tagsStore.tagBySlug(slug);
    if (existingTag) {
      const error = new InputError('Tag already exists');
      await auditorEvent.fail({ error });
      return res.status(409).json({ error: error.message });
    }

    const tag = {
      title,
      slug,
    };

    await persistenceContext.tagsStore.insert(tag);

    if (events) {
      events.publish({
        topic: EVENTS_TOPIC_ANNOUNCEMENTS,
        eventPayload: {
          tag: tag.slug,
        },
        metadata: { action: EVENTS_ACTION_CREATE_TAG },
      });
    }

    await auditorEvent.success();
    return res.status(201).json(tag);
  });

  router.delete(
    '/tags/:slug',
    async (req: Request<{ slug: string }, {}, {}, {}>, res) => {
      const auditorEvent = await auditor.createEvent({
        eventId: AUDITOR_MUTATE_EVENT_ID,
        request: req,
        severityLevel: 'medium',
        meta: {
          actionType: AUDITOR_ACTION_DELETE,
        },
      });

      if (!(await isRequestAuthorized(req, announcementDeletePermission))) {
        const error = new NotAllowedError('Unauthorized');
        await auditorEvent.fail({ error });
        throw error;
      }

      const { slug } = req.params;

      if (!slug || typeof slug !== 'string' || slug.trim() === '') {
        const error = new InputError('Invalid tag slug');
        await auditorEvent.fail({ error });
        return res.status(400).json({ error: error.message });
      }

      const announcementsByTag =
        await persistenceContext.announcementsStore.announcements({
          tags: [slug],
        });

      if (announcementsByTag.count) {
        const error = new NotAllowedError(
          'Tag to delete is used in some announcements',
        );
        await auditorEvent.fail({ error });
        throw error;
      }

      const existingTag = await persistenceContext.tagsStore.tagBySlug(slug);
      if (!existingTag) {
        const error = new NotFoundError('Tag not found');
        await auditorEvent.fail({ error });
        return res.status(404).json({ error: error.message });
      }

      await persistenceContext.tagsStore.delete(slug);

      if (events) {
        events.publish({
          topic: EVENTS_TOPIC_ANNOUNCEMENTS,
          eventPayload: {
            tag: slug,
          },
          metadata: { action: EVENTS_ACTION_DELETE_TAG },
        });
      }

      await auditorEvent.success();
      return res.status(204).end();
    },
  );

  router.use(MiddlewareFactory.create({ config, logger }).error());

  return router;
}
