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
import { stringifyEntityRef, type Entity } from '@backstage/catalog-model';

import type { Check } from '@backstage-community/plugin-tech-insights-common/client';
import type {
  BulkCheckResponse,
  CheckResponse,
  CheckResult,
} from '@backstage-community/plugin-tech-insights-common';
import { useCurrentKindTitle } from '@backstage-community/plugin-manage-react';

export function stringifyCheck(check: Check | CheckResponse): string {
  return `${check.id}-${check.name}-${check.type}`;
}

export function eqCheck(a: Check | CheckResponse, b: Check | CheckResponse) {
  return stringifyCheck(a) === stringifyCheck(b);
}

/**
 * Given a bulk response, it filters checks that are defined for the given
 * entities.
 *
 * It also filters out checks that are undefined for all entities, if chosen to.
 *
 * Returns:
 *   {
 *     responses: Map<entity string ref, CheckResult[]>
 *     usedChecks: Set<string> // stringified checks
 *   }
 *
 * @internal
 */
export function filterEmptyChecks(
  bulkCheckResponse: BulkCheckResponse | undefined,
  entities: Entity[],
  includeEmpty = false,
): { responses: Map<string, CheckResult[]>; usedChecks: Set<string> } {
  const responses = new Map<string, CheckResult[]>();

  const usedChecks = new Set<string>();

  const entitiesSet = new Set(
    entities.map(entity => stringifyEntityRef(entity)),
  );

  bulkCheckResponse
    ?.filter(resp => entitiesSet.has(resp.entity))
    ?.forEach(resp => {
      responses.set(resp.entity, resp.results);

      resp.results.forEach(res => {
        if (includeEmpty || typeof res.result !== 'undefined')
          usedChecks.add(stringifyCheck(res.check));
      });
    });

  return { responses, usedChecks };
}

export function useAccordionTitle() {
  const kindTitle = useCurrentKindTitle();

  return `Tech insights of your ${kindTitle}`;
}
