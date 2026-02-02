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

import { Check } from '@backstage-community/plugin-tech-insights-common';
import {
  createExtensionDataRef,
  createExtensionBlueprint,
} from '@backstage/frontend-plugin-api';
import { EntityPredicate } from '@backstage/plugin-catalog-react/alpha';

/**
 * @internal
 * @remarks accessible via `TechInsightsScorecardBlueprint`
 */
export const techInsightsScorecardExtensionData = {
  /**
   * Props to configure a scorecard, such as title, description, and check filters.
   */
  props: createExtensionDataRef<{
    title?: string;
    description?: string;
    checkIds?: string[];
    dense?: boolean;
    checkFilter?: (check: Check) => boolean;
  }>().with({
    id: 'tech-insights-scorecard.props',
  }),
  /**
   * An expression-based filter to determine if a scorecard should be shown for an entity.
   */
  filterExpression: createExtensionDataRef<EntityPredicate>().with({
    id: 'tech-insights-scorecard.filter-expression',
  }),
};

/**
 * @alpha
 */
export type TechInsightsScorecardBlueprintParams = {
  title?: string;
  description?: string;
  checkIds?: string[];
  dense?: boolean;
  filter?: EntityPredicate;
  checkFilter?: (check: Check) => boolean;
};

/**
 * @alpha
 */
export const TechInsightsScorecardBlueprint = createExtensionBlueprint({
  kind: 'tech-insights-scorecard',
  attachTo: {
    id: 'entity-content:tech-insights/scorecards-content',
    input: 'scorecards',
  },
  dataRefs: {
    props: techInsightsScorecardExtensionData.props,
    filterExpression: techInsightsScorecardExtensionData.filterExpression,
  },
  config: {
    schema: {
      filter: z => z.record(z.unknown()).optional(),
      title: z => z.string().optional(),
      description: z => z.string().optional(),
      checkIds: z => z.array(z.string()).optional(),
      dense: z => z.boolean().optional(),
    },
  },
  output: [
    techInsightsScorecardExtensionData.props,
    techInsightsScorecardExtensionData.filterExpression.optional(),
  ],
  *factory(params: TechInsightsScorecardBlueprintParams, { config }) {
    yield techInsightsScorecardExtensionData.props({
      title: config.title ?? params.title,
      description: config.description ?? params.description,
      checkIds: config.checkIds ?? params.checkIds,
      dense: config.dense ?? params.dense,
      checkFilter: params.checkFilter,
    });

    const filterExpr =
      (config.filter as EntityPredicate | undefined) ?? params.filter;
    if (filterExpr) {
      yield techInsightsScorecardExtensionData.filterExpression(filterExpr);
    }
  },
});
