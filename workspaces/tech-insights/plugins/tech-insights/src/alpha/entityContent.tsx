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

import {
  techInsightsScorecardFilterDataRef,
  techInsightsScorecardFilterExpressionDataRef,
  techInsightsScorecardPropsDataRef,
} from '@backstage-community/plugin-tech-insights-react/alpha';
import { Entity } from '@backstage/catalog-model';
import { compatWrapper } from '@backstage/core-compat-api';
import { createExtensionInput } from '@backstage/frontend-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import {
  EntityPredicate,
  entityPredicateToFilterFunction,
  EntityContentBlueprint,
} from '@backstage/plugin-catalog-react/alpha';

// Inspired by https://github.com/backstage/backstage/blob/0fd688a452a54451ca3014b0da17e071e8bfebee/plugins/catalog/src/alpha/filter/FilterWrapper.tsx#L30-L33. This could be removed once the framework provides
// predicate filter functions.
function buildFilterFn(
  filterFn?: (entity: Entity) => boolean,
  filterExpr?: EntityPredicate,
): (entity: Entity) => boolean {
  if (filterFn) return filterFn;
  if (filterExpr) return entityPredicateToFilterFunction(filterExpr);
  return () => true;
}

export const entityTechInsightsScorecardContent =
  EntityContentBlueprint.makeWithOverrides({
    name: 'scorecards',
    inputs: {
      scorecards: createExtensionInput([
        techInsightsScorecardPropsDataRef,
        techInsightsScorecardFilterDataRef.optional(),
        techInsightsScorecardFilterExpressionDataRef.optional(),
      ]),
    },
    factory(originalFactory, { inputs }) {
      return originalFactory(defineParams =>
        defineParams({
          path: '/tech-insights',
          title: 'Scorecards',
          loader: async () => {
            const { ScorecardsContent } = await import(
              '../components/ScorecardsContent'
            );

            const scorecards = inputs.scorecards.map(scorecard => ({
              props: scorecard.get(techInsightsScorecardPropsDataRef),
              filter: buildFilterFn(
                scorecard.get(techInsightsScorecardFilterDataRef),
                scorecard.get(techInsightsScorecardFilterExpressionDataRef),
              ),
            }));

            const Component = () => {
              const { entity } = useEntity();

              const scorecard = scorecards.find(s => s.filter(entity));
              const matchingScorecards = scorecards.filter(s =>
                s.filter(entity),
              );
              const aggregatedCheckIds = matchingScorecards.flatMap(
                s => s.props.checkIds ?? [],
              );
              const props = scorecard?.props ?? {};

              return (
                <ScorecardsContent
                  title={props.title ?? 'Scorecards'}
                  description={props.description}
                  checksId={
                    aggregatedCheckIds.length > 0
                      ? aggregatedCheckIds
                      : undefined
                  }
                  dense={props.dense}
                  filter={props.checkFilter}
                />
              );
            };

            return compatWrapper(<Component />);
          },
        }),
      );
    },
  });
