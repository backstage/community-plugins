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
import { NotFoundError } from '@backstage/errors';
import { PersistenceContext } from '../service/persistence';

/**
 * Registers the `announcements:get-announcement` action.
 * @internal
 */
export function createGetAnnouncementAction(options: {
  actionsRegistry: ActionsRegistryService;
  persistenceContext: PersistenceContext;
}) {
  const { actionsRegistry, persistenceContext } = options;

  actionsRegistry.register({
    name: 'announcements:get-announcement',
    title: 'Get Announcement',
    description: 'Fetch the full details of a single announcement by its ID.',
    attributes: {
      readOnly: true,
      destructive: false,
      idempotent: true,
    },
    schema: {
      input: z =>
        z.object({
          id: z.string().describe('The UUID of the announcement to retrieve'),
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
          tags: z
            .array(z.object({ slug: z.string(), title: z.string() }))
            .optional(),
        }),
    },
    async action({ input }) {
      const announcement =
        await persistenceContext.announcementsStore.announcementByID(input.id);

      if (!announcement) {
        throw new NotFoundError(`Announcement with ID ${input.id} not found`);
      }

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
          tags: announcement.tags,
        },
      };
    },
  });
}
