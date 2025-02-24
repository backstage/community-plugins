/*
 * Copyright 2025 The Backstage Authors
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

import { useApi } from '@backstage/core-plugin-api';
import { Entity } from '@backstage/catalog-model';
import { techInsightsApiRef } from '@backstage-community/plugin-tech-insights';
import type { Check } from '@backstage-community/plugin-tech-insights-common/client';

import { useManageTechInsights } from '../components/ManageProvider';
import { filterEmptyChecks, stringifyCheck } from '../utils';

export function useEntityInsights(
  entities: Entity[],
  checkFilter: ((check: Check) => boolean) | undefined,
  showEmpty: boolean,
) {
  const { allChecks, bulkCheckResponse, renderers } =
    useManageTechInsights(checkFilter);
  const techInsightsApi = useApi(techInsightsApiRef);

  const { usedChecks, responses } = filterEmptyChecks(
    bulkCheckResponse,
    entities,
    showEmpty,
  );

  const filteredChecks = allChecks.filter(check =>
    showEmpty ? true : usedChecks.has(stringifyCheck(check)),
  );

  return {
    techInsightsApi,
    responses,
    checks: filteredChecks,
    renderers,
  };
}

export type UseEntityInsightsResult = ReturnType<typeof useEntityInsights>;
