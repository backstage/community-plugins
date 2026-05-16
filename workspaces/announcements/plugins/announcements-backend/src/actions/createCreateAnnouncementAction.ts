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
import { ActionsRegistryService } from '@backstage/backend-plugin-api/alpha';
import { PermissionsService } from '@backstage/backend-plugin-api';
import { NotAllowedError } from '@backstage/errors';
import { AuthorizeResult } from '@backstage/plugin-permission-common';
import { announcementEntityPermissions } from '@backstage-community/plugin-announcements-common';
import { DateTime } from 'luxon';
import { v4 as uuid } from 'uuid';
import { PersistenceContext } from '../service/persistence';

const { announcementCreatePermission } = announcementEntityPermissions;

/**
 * Registers the `announcements:create-announcement` action.
 * @internal
 */
export function createCreateAnnouncementAction(options: {
  actionsRegistry: ActionsRegistryService;
  persistenceContext: PersistenceContext;
  permissions: PermissionsService;
}) {
  const { actionsRegistry, persistenceContext, permissions } = options;

  actionsRegistry.register({
    name: 'announcements:create-announcement',
    title: 'Create Announcement',
    description:
      'Create a new announcement. Requires the announcement.entity.create permission.',
    attributes: {
      readOnly: false,
      destructive: false,
      idempotent: false,
    },
    visibilityPermission: announcementCreatePermission,
    schema: {
      input: z =>
        z.object({
          title: z.string().describe('Title of the announcement'),
          excerpt: z.string().describe('Short summary shown in listing views'),
          body: z.string().describe('Full body text of the announcement'),
          publisher: z
            .string()
            .describe('User or team publishing the announcement'),
          active: z
            .boolean()
            .default(true)
            .describe('Whether the announcement is active'),
          start_at: z
            .string()
            .describe('ISO 8601 datetime when the announcement becomes active'),
          until_date: z
            .string()
            .optional()
            .describe(
              'ISO 8601 datetime when the announcement expires (optional)',
            ),
          category: z
            .string()
            .optional()
            .describe('Category slug to assign to the announcement'),
          on_behalf_of: z
            .string()
            .optional()
            .describe('Optional entity ref the announcement is on behalf of'),
          tags: z
            .array(z.string())
            .optional()
            .describe('Tag slugs to attach to the announcement'),
          sendNotification: z
            .boolean()
            .default(false)
            .describe(
              'Whether to send a notification when the announcement is created',
            ),
        }),
      output: z =>
        z.object({
          id: z.string(),
          title: z.string(),
          excerpt: z.string(),
          body: z.string(),
          publisher: z.string(),
          active: z.boolean(),
          created_at: z.string(),
          start_at: z.string(),
          until_date: z.string().nullable().optional(),
          updated_at: z.string(),
          category: z
            .object({ slug: z.string(), title: z.string() })
            .optional(),
          on_behalf_of: z.string().optional(),
        }),
    },
    async action({ input, credentials }) {
      const decision = await permissions.authorize(
        [{ permission: announcementCreatePermission }],
        { credentials },
      );

      if (decision[0].result === AuthorizeResult.DENY) {
        throw new NotAllowedError(
          'Unauthorized: missing announcement.entity.create permission',
        );
      }

      const now = DateTime.now();
      const startAt = DateTime.fromISO(input.start_at);
      const untilDate = input.until_date
        ? DateTime.fromISO(input.until_date)
        : undefined;

      const announcement =
        await persistenceContext.announcementsStore.insertAnnouncement({
          id: uuid(),
          title: input.title,
          excerpt: input.excerpt,
          body: input.body,
          publisher: input.publisher,
          active: input.active,
          sendNotification: input.sendNotification,
          category: input.category,
          on_behalf_of: input.on_behalf_of,
          tags: input.tags,
          created_at: now,
          start_at: startAt,
          until_date: untilDate,
          updated_at: now,
        });

      return {
        output: {
          id: announcement.id,
          title: announcement.title,
          excerpt: announcement.excerpt,
          body: announcement.body,
          publisher: announcement.publisher,
          active: announcement.active,
          created_at: announcement.created_at.toUTC().toISO()!,
          start_at: announcement.start_at.toUTC().toISO()!,
          until_date: announcement.until_date
            ? announcement.until_date.toUTC().toISO()
            : undefined,
          updated_at: announcement.updated_at.toUTC().toISO()!,
          category: announcement.category,
          on_behalf_of: announcement.on_behalf_of,
        },
      };
    },
  });
}
