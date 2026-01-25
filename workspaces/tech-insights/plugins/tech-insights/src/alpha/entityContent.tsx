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
import {
  coreExtensionData,
  createExtensionBlueprint,
  createExtensionDataRef,
  createExtensionInput,
} from '@backstage/frontend-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import {
  EntityContentBlueprint,
  EntityPredicate,
  entityPredicateToFilterFunction,
} from '@backstage/plugin-catalog-react/alpha';
import { ScorecardsContent } from '../components/ScorecardsContent';
import { Check } from '@backstage-community/plugin-tech-insights-common';

/**
 * Entity content extension that displays Tech Insights scorecards for an entity.
 *
 * @alpha
 */
export const entityTechInsightsScorecardContent = EntityContentBlueprint.make({
  name: 'scorecards',
  params: {
    path: '/tech-insights',
    title: 'Scorecards',
    loader: () =>
      import('../components/ScorecardsContent').then(m =>
        compatWrapper(<m.ScorecardsContent title="Scorecards" />),
      ),
  },
});

/**
 * @alpha
 * Data ref for tech insights scorecard entity predicate filter
 */
export const techInsightsScorecardFilterDataRef =
  createExtensionDataRef<EntityPredicate>().with({
    id: 'tech-insights.scorecard-filter',
  });

/**
 * @alpha
 * Entity content extension that displays tech insights for an entity
 */
export const techInsightsScorecardContent =
  EntityContentBlueprint.makeWithOverrides({
    name: 'scorecard',
    inputs: {
      scorecards: createExtensionInput([
        coreExtensionData.reactElement,
        techInsightsScorecardFilterDataRef.optional(),
      ]),
    },
    factory: (originalFactory, { inputs }) => {
      return originalFactory({
        path: '/tech-insights',
        title: 'Scorecards',
        loader: async () => {
          const scorecards = inputs.scorecards.map(scorecard => ({
            element: scorecard.get(coreExtensionData.reactElement),
            filter: entityPredicateToFilterFunction(
              scorecard.get(techInsightsScorecardFilterDataRef) ?? {},
            ),
          }));

          const Component = () => {
            const { entity } = useEntity();

            const applicableScorecards = scorecards.filter(s =>
              s.filter(entity),
            );

            return (
              <div>
                {applicableScorecards.length > 0
                  ? applicableScorecards.map((s, idx) => (
                      <div key={idx}>{s.element}</div>
                    ))
                  : null}
              </div>
            );
          };

          return <Component />;
        },
      });
    },
  });

export const TechInsightsScorecardBlueprint = createExtensionBlueprint({
  kind: 'tech-insights-scorecard',
  attachTo: {
    id: 'entity-content:tech-insights/scorecard',
    input: 'scorecards',
  },
  config: {
    schema: {
      title: z => z.string().optional(),
      description: z => z.string().optional(),
      checkIds: z => z.array(z.string()),
      dense: z => z.boolean().optional(),
    },
  },
  output: [
    coreExtensionData.reactElement,
    techInsightsScorecardFilterDataRef.optional(),
  ],
  *factory(
    params: {
      title?: string;
      description?: string;
      checkIds?: string[];
      dense?: boolean;
      filter?: EntityPredicate;
      checkFilter?: (check: Check) => boolean;
    },
    { config },
  ) {
    yield coreExtensionData.reactElement(
      <ScorecardsContent
        checksId={config.checkIds ?? params.checkIds}
        title={config.title ?? params.title ?? 'Scorecards'}
        dense={config.dense ?? params.dense}
        filter={params.checkFilter}
      />,
    );

    if (params.filter) {
      yield techInsightsScorecardFilterDataRef(params.filter);
    }
  },
});
