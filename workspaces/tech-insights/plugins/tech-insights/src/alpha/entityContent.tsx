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
  createExtensionInput,
} from '@backstage/frontend-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import {
  EntityContentBlueprint,
  entityPredicateToFilterFunction,
} from '@backstage/plugin-catalog-react/alpha';
import {
  techInsightsScorecardFilterDataRef,
  TechInsightsScorecardBlueprint,
} from '@backstage-community/plugin-tech-insights-react/alpha';

/**
 * Entity content extension for displaying Tech Insights scorecards.
 *
 * Accepts scorecard child extensions created with TechInsightsScorecardBlueprint.
 *
 * @alpha
 */
export const entityTechInsightsScorecardContent =
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
        // Default filter excludes User entities (they typically don't have scorecards)
        // Can be overridden via app-config.yaml:
        // - entity-content:tech-insights/scorecard:
        //     config:
        //       filter:
        //         $not:
        //           kind:
        //             $in: [User, Group]
        filter: { $not: { kind: 'User' } },
        loader: async () => {
          // Separate scorecards into those with filters (specific) and without (default)
          const scorecards = inputs.scorecards.map(scorecard => {
            const predicate = scorecard.get(techInsightsScorecardFilterDataRef);
            const hasFilter =
              predicate !== undefined && Object.keys(predicate).length > 0;
            return {
              element: scorecard.get(coreExtensionData.reactElement),
              filter: entityPredicateToFilterFunction(predicate ?? {}),
              hasFilter,
            };
          });

          const Component = () => {
            const { entity } = useEntity();

            // Find scorecards with specific filters that match this entity
            const specificMatches = scorecards.filter(
              s => s.hasFilter && s.filter(entity),
            );

            // If specific scorecards match, show only those (they override default)
            const applicableScorecards =
              specificMatches.length > 0
                ? specificMatches
                : scorecards.filter(s => !s.hasFilter && s.filter(entity));

            if (applicableScorecards.length === 0) {
              return null;
            }

            return (
              <>
                {applicableScorecards.map((s, idx) => (
                  <div key={idx}>{s.element}</div>
                ))}
              </>
            );
          };

          return compatWrapper(<Component />);
        },
      });
    },
  });

/**
 * Default scorecard extension that displays all Tech Insights checks.
 * Enabled by default with no entity filter (matches all entities).
 *
 * @alpha
 */
export const defaultTechInsightsScorecard = TechInsightsScorecardBlueprint.make(
  {
    name: 'default',
    params: {
      title: 'Scorecards',
      loader: async options => {
        const { ScorecardsContent } = await import(
          '../components/ScorecardsContent'
        );
        return compatWrapper(
          <ScorecardsContent
            title={options.title}
            description={options.description}
            checksId={options.checksId}
            dense={options.dense}
            filter={options.checkFilter}
          />,
        );
      },
    },
  },
);
