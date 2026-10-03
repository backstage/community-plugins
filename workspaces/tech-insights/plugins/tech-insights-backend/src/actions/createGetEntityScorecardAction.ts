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
import { ActionsRegistryService } from '@backstage/backend-plugin-api/alpha';
import {
  EntityReportDeps,
  formatResult,
  getEntityReport,
} from './entityReport';

export const createGetEntityScorecardAction = ({
  actionsRegistry,
  ...deps
}: EntityReportDeps & {
  actionsRegistry: ActionsRegistryService;
}) => {
  actionsRegistry.register({
    name: 'tech-insights-get-entity-scorecard',
    title: 'Get Entity Scorecard',
    attributes: {
      destructive: false,
      readOnly: true,
      idempotent: true,
    },
    description: 'Returns a categorized compliance scorecard for an entity.',
    schema: {
      input: z =>
        z.object({
          kind: z.string().describe('The kind of the entity, e.g. Component'),
          namespace: z
            .string()
            .describe('The namespace of the entity. Defaults to "default".')
            .default('default'),
          name: z.string().describe('The name of the entity'),
        }),
      output: z =>
        z.object({
          entity: z.string().describe('The entity ref of the entity'),
          categories: z
            .array(
              z.object({
                name: z.string().describe('The name of the category'),
                checks: z
                  .array(
                    z.object({
                      name: z.string().describe('The name of the check'),
                      result: z
                        .enum(['PASS', 'FAIL', 'N/A'])
                        .describe('Whether the entity passes the check'),
                    }),
                  )
                  .describe('The checks in this category'),
              }),
            )
            .describe('The checks of the entity, grouped by category'),
        }),
    },
    action: async ({ input, credentials }) => {
      const { entityRef, applicableChecks, resultById } = await getEntityReport(
        deps,
        input,
        credentials,
      );

      const categories = new Map<
        string,
        { name: string; result: ReturnType<typeof formatResult> }[]
      >();
      for (const check of applicableChecks) {
        const category = String(check.metadata?.category ?? 'Uncategorized');
        const entries = categories.get(category) ?? [];
        entries.push({
          name: check.name,
          result: formatResult(resultById.get(check.id)?.result),
        });
        categories.set(category, entries);
      }

      return {
        output: {
          entity: entityRef,
          categories: [...categories.entries()].map(([name, checks]) => ({
            name,
            checks,
          })),
        },
      };
    },
  });
};
