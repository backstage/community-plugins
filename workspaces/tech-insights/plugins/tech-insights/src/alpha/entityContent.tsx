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
import { compatWrapper } from '@backstage/core-compat-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import {
  EntityContentBlueprint,
  EntityPredicate,
  entityPredicateToFilterFunction,
} from '@backstage/plugin-catalog-react/alpha';

export const entityTechInsightsScorecardContent =
  EntityContentBlueprint.makeWithOverrides({
    name: 'scorecard',
    config: {
      schema: {
        description: z => z.string().optional(),
        checkIds: z => z.array(z.string()).optional(),
        dense: z => z.boolean().optional(),
        variants: z =>
          z
            .array(
              z.object({
                filter: z.record(z.unknown()),
                title: z.string().optional(),
                description: z.string().optional(),
                checkIds: z.array(z.string()).optional(),
                dense: z.boolean().optional(),
              }),
            )
            .optional(),
      },
    },
    factory: (originalFactory, { config }) => {
      return originalFactory({
        path: '/tech-insights',
        title: config.title ?? 'Scorecards',
        loader: async () => {
          const { ScorecardsContent } = await import(
            '../components/ScorecardsContent'
          );

          const Component = () => {
            const { entity } = useEntity();

            const variant = config.variants?.find(v =>
              entityPredicateToFilterFunction(v.filter as EntityPredicate)(
                entity,
              ),
            );

            return (
              <ScorecardsContent
                title={variant?.title ?? config.title ?? 'Scorecards'}
                description={variant?.description ?? config.description}
                checksId={variant?.checkIds ?? config.checkIds}
                dense={variant?.dense ?? config.dense}
              />
            );
          };

          return compatWrapper(<Component />);
        },
      });
    },
  });
