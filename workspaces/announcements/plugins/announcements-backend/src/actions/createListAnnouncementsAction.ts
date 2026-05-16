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
import { PersistenceContext } from '../service/persistence';

/**
 * Registers the `announcements:list-announcements` action.
 * @internal
 */
export function createListAnnouncementsAction(options: {
  actionsRegistry: ActionsRegistryService;
  persistenceContext: PersistenceContext;
}) {
  const { actionsRegistry, persistenceContext } = options;

  actionsRegistry.register({
    name: 'announcements:list-announcements',
    title: 'List Announcements',
    description:
      'List announcements with optional filters for category, active status, pagination and sort order.',
    attributes: {
      readOnly: true,
      destructive: false,
      idempotent: true,
    },
    schema: {
      input: z =>
        z.object({
          max: z
            .number()
            .int()
            .positive()
            .optional()
            .describe('Maximum number of results to return'),
          page: z
            .number()
            .int()
            .positive()
            .optional()
            .describe('Page number (1-based) for pagination'),
          category: z.string().optional().describe('Filter by category slug'),
          tags: z.array(z.string()).optional().describe('Filter by tag slugs'),
          active: z.boolean().optional().describe('Filter by active status'),
          sortBy: z
            .enum(['created_at', 'start_at', 'updated_at'])
            .optional()
            .describe('Field to sort by (default: created_at)'),
          order: z
            .enum(['asc', 'desc'])
            .optional()
            .describe('Sort order (default: desc)'),
        }),
      output: z =>
        z.object({
          count: z
            .number()
            .describe('Total number of announcements matching the query'),
          announcements: z.array(
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
          ),
        }),
    },
    async action({ input }) {
      const { max, page, category, tags, active, sortBy, order } = input;
      const results = await persistenceContext.announcementsStore.announcements(
        {
          max,
          offset: page ? (page - 1) * (max ?? 10) : undefined,
          category,
          tags,
          active,
          sortBy: sortBy ?? 'created_at',
          order: order ?? 'desc',
        },
      );

      return {
        output: {
          count: results.count,
          announcements: results.results.map(a => ({
            id: a.id,
            title: a.title,
            excerpt: a.excerpt,
            body: a.body,
            publisher: a.publisher,
            active: a.active,
            created_at: a.created_at.toUTC().toISO()!,
            start_at: a.start_at.toUTC().toISO()!,
            until_date: a.until_date ? a.until_date.toUTC().toISO() : undefined,
            updated_at: a.updated_at.toUTC().toISO()!,
            category: a.category,
            on_behalf_of: a.on_behalf_of,
            tags: a.tags,
          })),
        },
      };
    },
  });
}
