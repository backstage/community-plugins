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
import { techInsightsFactRetrieverReadPermission } from '@backstage-community/plugin-tech-insights-common';
import { TechInsightsStore } from '@backstage-community/plugin-tech-insights-node';
import { authorize, toEntityRef } from './utils';

export const createGetLatestFactsAction = ({
  actionsRegistry,
  permissions,
  techInsightsStore,
}: {
  actionsRegistry: ActionsRegistryService;
  permissions: PermissionsService;
  techInsightsStore: TechInsightsStore;
}) => {
  actionsRegistry.register({
    name: 'tech-insights-get-latest-facts',
    title: 'Get Latest Tech Insights Facts',
    attributes: {
      destructive: false,
      readOnly: true,
      idempotent: true,
    },
    description: 'Returns the latest facts for an entity and fact retrievers.',
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
            .describe('The fact retriever ids to get the latest facts for'),
        }),
      output: z =>
        z.object({
          facts: z
            .record(z.string(), z.unknown())
            .describe('The latest fact of each requested fact retriever'),
        }),
    },
    action: async ({ input, credentials }) => {
      await authorize(
        permissions,
        credentials,
        techInsightsFactRetrieverReadPermission,
      );

      return {
        output: {
          facts: await techInsightsStore.getLatestFactsByIds(
            input.ids,
            toEntityRef(input.entity),
          ),
        },
      };
    },
  });
};
