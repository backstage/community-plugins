import express, { Request } from 'express';
import Router from 'express-promise-router';
import { DateTime } from 'luxon';
import slugify from 'slugify';
import { v4 as uuid } from 'uuid';
import { errorHandler } from '@backstage/backend-common';
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
} from '@backstage-community/plugin-announcements-common';
import { AnnouncementsContext } from './announcementsContextBuilder';
import { createPermissionIntegrationRouter } from '@backstage/plugin-permission-node';

interface AnnouncementRequest {
  publisher: string;
  category?: string;
  title: string;
  excerpt: string;
  body: string;
}

interface CategoryRequest {
  title: string;
}

export async function createRouter(
  options: AnnouncementsContext,
): Promise<express.Router> {
  const { persistenceContext, permissions, httpAuth } = options;

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

  // eslint-disable-next-line spaced-comment
  /*****************
   * Announcements *
   ****************/
  router.get(
    '/announcements',
    async (
      req: Request<
        {},
        {},
        {},
        { category?: string; page?: number; max?: number }
      >,
      res,
    ) => {
      const results = await persistenceContext.announcementsStore.announcements(
        {
          category: req.query.category,
          max: req.query.max,
          offset: req.query.page
            ? (req.query.page - 1) * (req.query.max ?? 10)
            : undefined,
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

      await persistenceContext.announcementsStore.deleteAnnouncementByID(
        req.params.id,
      );

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
          },
        });

      return res.status(201).json(announcement);
    },
  );

  router.put(
    '/announcements/:id',
    async (req: Request<{ id: string }, {}, AnnouncementRequest, {}>, res) => {
      if (!(await isRequestAuthorized(req, announcementUpdatePermission))) {
        throw new NotAllowedError('Unauthorized');
      }

      const initialAnnouncement =
        await persistenceContext.announcementsStore.announcementByID(
          req.params.id,
        );
      if (!initialAnnouncement) {
        return res.status(404).end();
      }

      const announcement =
        await persistenceContext.announcementsStore.updateAnnouncement({
          ...initialAnnouncement,
          ...{
            title: req.body.title,
            excerpt: req.body.excerpt,
            body: req.body.body,
            publisher: req.body.publisher,
            category: req.body.category,
          },
        });

      return res.status(200).json(announcement);
    },
  );

  // eslint-disable-next-line spaced-comment
  /**************
   * Categories *
   **************/
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

      return res.status(204).end();
    },
  );

  router.use(errorHandler());

  return router;
}
