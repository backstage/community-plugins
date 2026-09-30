/*
 * Copyright 2026 The Backstage Authors
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
import { PermissionsService } from '@backstage/backend-plugin-api';
import { ActionsRegistryService } from '@backstage/backend-plugin-api/alpha';
import { InputError } from '@backstage/errors';
import { techInsightsFactRetrieverReadPermission } from '@backstage-community/plugin-tech-insights-common';
import { TechInsightsStore } from '@backstage-community/plugin-tech-insights-node';
import { DateTime } from 'luxon';
import { authorize, toEntityRef } from './utils';

export const createGetFactsInRangeAction = ({
  actionsRegistry,
  permissions,
  techInsightsStore,
}: {
  actionsRegistry: ActionsRegistryService;
  permissions: PermissionsService;
  techInsightsStore: TechInsightsStore;
}) => {
  actionsRegistry.register({
    name: 'tech-insights-get-facts-in-range',
    title: 'Get Tech Insights Facts In Range',
    attributes: {
      destructive: false,
      readOnly: true,
      idempotent: true,
    },
    description: 'Returns facts for an entity over a time range.',
    schema: {
      input: z =>
        z.object({
          entity: z
            .string()
            .describe(
              'The entity ref to get facts for, e.g. component:default/my-service',
            ),
          ids: z
            .array(z.string())
            .min(1)
            .describe('The fact retriever ids to get facts for'),
          startDateTime: z
            .string()
            .describe('Start of the time range as an ISO 8601 date-time'),
          endDateTime: z
            .string()
            .describe('End of the time range as an ISO 8601 date-time'),
        }),
      output: z =>
        z.object({
          facts: z
            .record(z.string(), z.array(z.unknown()))
            .describe(
              'The facts of each requested fact retriever within the range',
            ),
        }),
    },
    action: async ({ input, credentials }) => {
      await authorize(
        permissions,
        credentials,
        techInsightsFactRetrieverReadPermission,
      );

      const startDateTime = DateTime.fromISO(input.startDateTime);
      const endDateTime = DateTime.fromISO(input.endDateTime);
      if (!startDateTime.isValid || !endDateTime.isValid) {
        throw new InputError(
          'startDateTime and endDateTime must be valid ISO 8601 date-times',
        );
      }
      if (startDateTime > endDateTime) {
        throw new InputError(
          'startDateTime must not be later than endDateTime',
        );
      }

      return {
        output: {
          facts: await techInsightsStore.getFactsBetweenTimestampsByIds(
            input.ids,
            toEntityRef(input.entity),
            startDateTime,
            endDateTime,
          ),
        },
      };
    },
  });
};
