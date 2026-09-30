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
import { authorize } from './utils';

export const createGetFactSchemasAction = ({
  actionsRegistry,
  permissions,
  techInsightsStore,
}: {
  actionsRegistry: ActionsRegistryService;
  permissions: PermissionsService;
  techInsightsStore: TechInsightsStore;
}) => {
  actionsRegistry.register({
    name: 'tech-insights-get-fact-schemas',
    title: 'Get Tech Insights Fact Schemas',
    attributes: {
      destructive: false,
      readOnly: true,
      idempotent: true,
    },
    description:
      'Returns the latest schemas for Tech Insights fact retrievers.',
    schema: {
      input: z =>
        z.object({
          ids: z
            .array(z.string())
            .describe(
              'The fact retriever ids to get schemas for. If omitted, the schemas for all fact retrievers are returned.',
            )
            .optional(),
        }),
      output: z =>
        z.object({
          schemas: z
            .array(z.object({}).passthrough())
            .describe('The latest schema of each fact retriever'),
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
          schemas: await techInsightsStore.getLatestSchemas(input.ids),
        },
      };
    },
  });
};
