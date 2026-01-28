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
import { Entity } from '@backstage/catalog-model';
import {
  createExtensionDataRef,
  createExtensionBlueprint,
} from '@backstage/frontend-plugin-api';
import { EntityPredicate } from '@backstage/plugin-catalog-react/alpha';

/**
 * @alpha
 */
export const techInsightsScorecardPropsDataRef = createExtensionDataRef<{
  title?: string;
  description?: string;
  checkIds?: string[];
  dense?: boolean;
  checkFilter?: (check: Check) => boolean;
}>().with({
  id: 'tech-insights.scorecard.props',
});

/**
 * @alpha
 */
export const techInsightsScorecardFilterDataRef = createExtensionDataRef<
  (entity: Entity) => boolean
>().with({
  id: 'tech-insights.scorecard.filter-function',
});

/**
 * @alpha
 */
export const techInsightsScorecardFilterExpressionDataRef =
  createExtensionDataRef<EntityPredicate>().with({
    id: 'tech-insights.scorecard.filter-expression',
  });

/**
 * @alpha
 */
export const TechInsightsScorecardBlueprint = createExtensionBlueprint({
  kind: 'tech-insights-scorecard',
  attachTo: {
    id: 'entity-content:tech-insights/scorecards',
    input: 'scorecards',
  },
  dataRefs: {
    props: techInsightsScorecardPropsDataRef,
    filterFunction: techInsightsScorecardFilterDataRef,
    filterExpression: techInsightsScorecardFilterExpressionDataRef,
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
    techInsightsScorecardPropsDataRef,
    techInsightsScorecardFilterDataRef.optional(),
    techInsightsScorecardFilterExpressionDataRef.optional(),
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
    yield techInsightsScorecardPropsDataRef({
      title: config.title ?? params.title,
      description: config.description ?? params.description,
      checkIds: config.checkIds ?? params.checkIds,
      dense: config.dense ?? params.dense,
      checkFilter: params.checkFilter,
    });

    const filterExpr =
      (config.filter as EntityPredicate | undefined) ?? params.filter;
    if (filterExpr) {
      yield techInsightsScorecardFilterExpressionDataRef(filterExpr);
    }
  },
});
