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
import { NotAllowedError, NotFoundError } from '@backstage/errors';
import { AuthorizeResult } from '@backstage/plugin-permission-common';
import { announcementEntityPermissions } from '@backstage-community/plugin-announcements-common';
import { PersistenceContext } from '../service/persistence';

const { announcementDeletePermission } = announcementEntityPermissions;

/**
 * Registers the `announcements:delete-announcement` action.
 * @internal
 */
export function createDeleteAnnouncementAction(options: {
  actionsRegistry: ActionsRegistryService;
  persistenceContext: PersistenceContext;
  permissions: PermissionsService;
}) {
  const { actionsRegistry, persistenceContext, permissions } = options;

  actionsRegistry.register({
    name: 'announcements:delete-announcement',
    title: 'Delete Announcement',
    description:
      'Delete an announcement by its ID. Requires the announcement.entity.delete permission.',
    attributes: {
      readOnly: false,
      destructive: true,
      idempotent: true,
    },
    visibilityPermission: announcementDeletePermission,
    schema: {
      input: z =>
        z.object({
          id: z.string().describe('The UUID of the announcement to delete'),
        }),
      output: z =>
        z.object({
          success: z
            .boolean()
            .describe('True if the announcement was successfully deleted'),
        }),
    },
    async action({ input, credentials }) {
      const decision = await permissions.authorize(
        [{ permission: announcementDeletePermission }],
        { credentials },
      );

      if (decision[0].result === AuthorizeResult.DENY) {
        throw new NotAllowedError(
          'Unauthorized: missing announcement.entity.delete permission',
        );
      }

      const announcement =
        await persistenceContext.announcementsStore.announcementByID(input.id);

      if (!announcement) {
        throw new NotFoundError(`Announcement with ID ${input.id} not found`);
      }

      await persistenceContext.announcementsStore.deleteAnnouncementByID(
        input.id,
      );

      return { output: { success: true } };
    },
  });
}
