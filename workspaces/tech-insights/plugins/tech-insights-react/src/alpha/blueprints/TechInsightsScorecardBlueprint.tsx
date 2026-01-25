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
  coreExtensionData,
  createExtensionBlueprint,
  createExtensionDataRef,
  ExtensionBoundary,
} from '@backstage/frontend-plugin-api';
import { EntityPredicate } from '@backstage/plugin-catalog-react/alpha';
import { Check } from '@backstage-community/plugin-tech-insights-common';

export const techInsightsScorecardFilterDataRef =
  createExtensionDataRef<EntityPredicate>().with({
    id: 'tech-insights.entity-filter',
  });

/**
 * Options passed to the scorecard loader function.
 * @alpha
 */
export interface TechInsightsScorecardLoaderOptions {
  title: string;
  description?: string;
  checksId?: string[];
  checkFilter?: (check: Check) => boolean;
  dense?: boolean;
}

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
      checksId: z => z.array(z.string()).optional(),
      dense: z => z.boolean().optional(),
      filter: z => z.record(z.unknown()).optional(),
    },
  },
  output: [
    coreExtensionData.reactElement,
    techInsightsScorecardFilterDataRef.optional(),
  ],
  *factory(
    params: {
      loader: (
        options: TechInsightsScorecardLoaderOptions,
      ) => Promise<JSX.Element>;
      title: string;
      description?: string;
      checksId?: string[];
      checkFilter?: (check: Check) => boolean;
      filter?: EntityPredicate;
      dense?: boolean;
    },
    { node, config },
  ) {
    // Merge config with params
    const options: TechInsightsScorecardLoaderOptions = {
      title: config.title ?? params.title ?? 'Scorecards',
      description: config.description ?? params.description,
      checksId: config.checksId ?? params.checksId,
      dense: config.dense ?? params.dense,
      checkFilter: params.checkFilter,
    };

    yield coreExtensionData.reactElement(
      ExtensionBoundary.lazy(node, () => params.loader(options)),
    );

    const entityFilter =
      (config.filter as EntityPredicate | undefined) ?? params.filter;
    if (entityFilter) {
      yield techInsightsScorecardFilterDataRef(entityFilter);
    }
  },
});
