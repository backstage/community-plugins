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
import { stringifyEntityRef } from '@backstage/catalog-model';
import { InputError, NotFoundError } from '@backstage/errors';
import { CatalogService } from '@backstage/plugin-catalog-node';
import { IncidentFieldEnum } from '@backstage-community/plugin-servicenow-common';
import { ServiceNowClient } from '../service-now-rest/client';

const ANNOTATION_SERVICENOW_ENTITY_ID = 'servicenow.com/entity-id';

const ALLOWED_STATES = ['1', '2', '3', '6', '7', '8'] as const;
const ALLOWED_PRIORITIES = ['1', '2', '3', '4', '5'] as const;
const ORDER_BY_FIELDS = Object.values(IncidentFieldEnum) as [
  string,
  ...string[],
];

/**
 * Registers the `servicenow:list-incidents` action.
 * @internal
 */
export function createListIncidentsAction(options: {
  actionsRegistry: ActionsRegistryService;
  serviceNowClient: ServiceNowClient;
  catalog: CatalogService;
}) {
  const { actionsRegistry, serviceNowClient, catalog } = options;

  actionsRegistry.register({
    name: 'servicenow:list-incidents',
    title: 'List ServiceNow Incidents',
    description:
      "Fetch a paginated list of ServiceNow incidents scoped to a Backstage entity — the entity's `servicenow.com/entity-id` annotation is used to filter by u_backstage_entity_id. Also supports filtering by user email, state, priority, or a free-text search term.",
    attributes: {
      readOnly: true,
      destructive: false,
      idempotent: true,
    },
    schema: {
      input: z =>
        z.object({
          name: z.string().describe('The name of the catalog entity.'),
          kind: z
            .string()
            .optional()
            .describe(
              'The kind of the catalog entity, e.g. "Component", "System". Defaults to "System" if omitted.',
            ),
          namespace: z
            .string()
            .optional()
            .describe(
              'The namespace of the catalog entity. Defaults to "default" if omitted.',
            ),
          userEmail: z
            .string()
            .optional()
            .describe('User email to filter incidents by caller/assignee'),
          state: z
            .string()
            .refine(
              val =>
                val
                  .split(',')
                  .every(v =>
                    (ALLOWED_STATES as readonly string[]).includes(v.trim()),
                  ),
              {
                message: `state must be a comma-separated list of valid values: ${ALLOWED_STATES.join(
                  ', ',
                )}`,
              },
            )
            .optional()
            .describe(
              `ServiceNow incident state filter. Comma-separated values allowed. Valid values: 1 (New), 2 (In Progress), 3 (On Hold), 6 (Resolved), 7 (Closed), 8 (Canceled).`,
            ),
          priority: z
            .string()
            .refine(
              val =>
                val
                  .split(',')
                  .every(v =>
                    (ALLOWED_PRIORITIES as readonly string[]).includes(
                      v.trim(),
                    ),
                  ),
              {
                message: `priority must be a comma-separated list of valid values: ${ALLOWED_PRIORITIES.join(
                  ', ',
                )}`,
              },
            )
            .optional()
            .describe(
              `ServiceNow priority filter. Comma-separated values allowed. Valid values: 1 (Critical), 2 (High), 3 (Moderate), 4 (Low), 5 (Planning).`,
            ),
          search: z
            .string()
            .optional()
            .describe('Free-text search term for incident short_description'),
          limit: z
            .number()
            .optional()
            .describe('Maximum number of incidents to return (default: 10)'),
          offset: z
            .number()
            .optional()
            .describe(
              'Number of incidents to skip for pagination (default: 0)',
            ),
          order: z.enum(['asc', 'desc']).optional().describe('Sort direction'),
          orderBy: z
            .enum(ORDER_BY_FIELDS)
            .optional()
            .describe(
              `Field to sort by. Valid values: ${ORDER_BY_FIELDS.join(', ')}`,
            ),
        }),
      output: z =>
        z.object({
          totalCount: z.number(),
          incidents: z.array(
            z.object({
              sys_id: z.string(),
              number: z.string(),
              short_description: z.string(),
              description: z.string(),
              sys_created_on: z.string(),
              priority: z.number(),
              incident_state: z.number(),
              url: z.string(),
            }),
          ),
        }),
    },
    async action({ input, credentials, logger }) {
      logger.debug(
        `Fetching ServiceNow incidents with filters: ${JSON.stringify(input)}`,
      );

      const kind = input.kind ?? 'System';
      const namespace = input.namespace ?? 'default';
      const entityRef = stringifyEntityRef({
        kind,
        namespace,
        name: input.name,
      });
      const entity = await catalog.getEntityByRef(entityRef, {
        credentials,
      });
      if (!entity) {
        throw new NotFoundError(`Entity not found: ${entityRef}`);
      }
      const annotationValue =
        entity.metadata.annotations?.[ANNOTATION_SERVICENOW_ENTITY_ID];
      if (!annotationValue) {
        throw new InputError(
          `Entity ${entityRef} is missing the required annotation \`${ANNOTATION_SERVICENOW_ENTITY_ID}\``,
        );
      }
      const entityId = annotationValue;
      logger.debug(
        `Resolved entity ${entityRef} to ServiceNow entity ID: ${entityId}`,
      );

      const result = await serviceNowClient.fetchIncidents({
        u_backstage_entity_id: entityId,
        userEmail: input.userEmail,
        state: input.state ? `IN${input.state}` : undefined,
        priority: input.priority ? `IN${input.priority}` : undefined,
        search: input.search,
        limit: input.limit ?? 10,
        offset: input.offset ?? 0,
        order: input.order,
        orderBy: input.orderBy,
      });

      return {
        output: {
          totalCount: result.totalCount,
          incidents: result.items,
        },
      };
    },
  });
}
