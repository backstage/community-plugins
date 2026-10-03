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
import { Check } from '@backstage-community/plugin-tech-insights-common';
import { EntityReportDeps, getEntityReport } from './entityReport';

const MATURITY_LABELS = ['Stone', 'Bronze', 'Silver', 'Gold'];

const getCheckRank = (check: Check) => {
  const rank = Number(check.metadata?.rank ?? 0);
  return Number.isInteger(rank) && rank > 0 && rank < MATURITY_LABELS.length
    ? rank
    : undefined;
};

export const createGetEntityMaturityAction = ({
  actionsRegistry,
  ...deps
}: EntityReportDeps & {
  actionsRegistry: ActionsRegistryService;
}) => {
  actionsRegistry.register({
    name: 'tech-insights-get-entity-maturity',
    title: 'Get Entity Maturity',
    attributes: {
      destructive: false,
      readOnly: true,
      idempotent: true,
    },
    description:
      'Returns an entity maturity rank (Stone, Bronze, Silver or Gold) based on ranked check results.',
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
          rank: z.string().describe('The maturity rank the entity has reached'),
          maxRank: z
            .string()
            .describe('The highest maturity rank the entity could reach'),
        }),
    },
    action: async ({ input, credentials }) => {
      const { entityRef, applicableChecks, resultById } = await getEntityReport(
        deps,
        input,
        credentials,
      );

      const rankedChecks = applicableChecks.flatMap(check => {
        const rank = getCheckRank(check);
        return rank === undefined ? [] : [{ check, rank }];
      });
      const maxRank = Math.max(0, ...rankedChecks.map(({ rank }) => rank));

      let rank = maxRank;
      for (const { check, rank: checkRank } of rankedChecks) {
        if (resultById.get(check.id)?.result !== true && checkRank <= rank) {
          rank = checkRank - 1;
        }
      }

      return {
        output: {
          entity: entityRef,
          rank: MATURITY_LABELS[Math.max(0, rank)] ?? MATURITY_LABELS[0],
          maxRank: MATURITY_LABELS[maxRank] ?? MATURITY_LABELS[0],
        },
      };
    },
  });
};
