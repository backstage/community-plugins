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
import express, { Request, Response } from 'express';
import Router from 'express-promise-router';
import { InputError, NotAllowedError } from '@backstage/errors';
import {
  AuthorizeResult,
  BasicPermission,
} from '@backstage/plugin-permission-common';
import {
  announcementEntityPermissions,
  AUDITOR_SETTINGS_EVENT_ID,
  AUDITOR_ACTION_SETTINGS_UPDATE,
  AUDITOR_ACTION_SETTINGS_RESET,
  Settings,
  settingsSchema,
} from '@backstage-community/plugin-announcements-common';
import { SettingsDatabase } from './database/SettingsDatabase';
import {
  AuditorService,
  HttpAuthService,
  LoggerService,
  PermissionsService,
} from '@backstage/backend-plugin-api';

interface SettingsRouterContext {
  settingsStore: SettingsDatabase;
  httpAuth: HttpAuthService;
  permissions: PermissionsService;
  logger: LoggerService;
  auditor: AuditorService;
}

/**
 * Creates a router for settings endpoints.
 */
export function createSettingsRouter(
  context: SettingsRouterContext,
): express.Router {
  const { settingsStore, httpAuth, permissions, logger, auditor } = context;

  const { announcementSettingsPermission } = announcementEntityPermissions;

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

  /**
   * Retrieves the current settings for the announcements plugin
   */
  router.get('/settings', async (_, res: Response<{ settings: Settings }>) => {
    try {
      // no permissions check or auditing necessary for retrieving settings
      const settings = settingsStore.getAll();
      return res.json({ settings });
    } catch (err) {
      throw err;
    }
  });

  /**
   * Updates the settings for the announcements plugin - only the settings that are provided in the request body are updated
   */
  router.patch(
    '/settings',
    async (
      req: Request<{}, {}, Partial<Settings>, {}>,
      res: Response<{ settings: Settings }>,
    ) => {
      const auditorEvent = await auditor.createEvent({
        eventId: AUDITOR_SETTINGS_EVENT_ID,
        request: req,
        severityLevel: 'medium',
        meta: {
          actionType: AUDITOR_ACTION_SETTINGS_UPDATE,
        },
      });

      if (!(await isRequestAuthorized(req, announcementSettingsPermission))) {
        const error = new NotAllowedError('Unauthorized');
        await auditorEvent.fail({ error });
        throw error;
      }

      try {
        // We do a partial parse to allow for only updating the settings that are provided in the request body
        const validationResult = settingsSchema.partial().safeParse(req.body);

        if (!validationResult.success) {
          const error = new InputError(
            `Invalid settings: ${validationResult.error.errors
              .map(e => `${e.path.join('.')}: ${e.message}`)
              .join(', ')}`,
          );

          await auditorEvent.fail({ error });
          throw error;
        }

        await settingsStore.update(validationResult.data);
        await auditorEvent.success();

        return res.status(200).json({ settings: settingsStore.getAll() });
      } catch (err) {
        if (err instanceof InputError || err instanceof NotAllowedError) {
          await auditorEvent.fail({ error: err });
          throw err;
        }
        logger.error('Failed to update settings', err);
        const error = new InputError('Failed to update settings');
        await auditorEvent.fail({ error });
        throw error;
      }
    },
  );

  /**
   * Resets all settings for the announcements plugin to defaults
   */
  router.delete(
    '/settings',
    async (req, res: Response<{ settings: Settings }>) => {
      const auditorEvent = await auditor.createEvent({
        eventId: AUDITOR_SETTINGS_EVENT_ID,
        request: req,
        severityLevel: 'medium',
        meta: {
          actionType: AUDITOR_ACTION_SETTINGS_RESET,
        },
      });

      if (!(await isRequestAuthorized(req, announcementSettingsPermission))) {
        const error = new NotAllowedError('Unauthorized');
        await auditorEvent.fail({ error });
        throw error;
      }

      try {
        await settingsStore.reset();
        await auditorEvent.success();

        return res.status(200).json({ settings: settingsStore.getAll() });
      } catch (err) {
        logger.error('Failed to reset settings', err);
        const error = new InputError('Failed to reset settings');
        await auditorEvent.fail({ error });
        throw error;
      }
    },
  );

  return router;
}
